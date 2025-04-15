import openmeteo_requests
import torch
import json
import re
from datasets import load_dataset
import requests
from datetime import datetime
import requests_cache
import pandas as pd
import copy
from retry_requests import retry
from tqdm.notebook import tqdm
import time
import numpy as np
from typing import List, Dict, Tuple, Optional, Literal, Union, Callable, Any
from dataclasses import dataclass
from enum import Enum
from tavily import TavilyClient
import pickle
from transformers import T5Tokenizer, T5ForSequenceClassification, T5ForConditionalGeneration, PreTrainedTokenizer, PreTrainedModel, AutoTokenizer, AutoModelForSeq2SeqLM, AutoConfig, AutoModel, AutoModelForCausalLM, BitsAndBytesConfig
device = 'cuda' if torch.cuda.is_available() else 'cpu'
def prompt_template(description : str) -> str:
    return f"""You are a helpful AI assistant that can use tools. Available tools:

{description}

To use a tool, output in this format:
{{
    "name": "tool_name",
    "arguments": {{
        "arg1": "value1",
        "arg2": "value2"
    }}
}}

Respond to the user's request, using tools whenever necessary. You are not allowed to make nested tool calls. You can only make tool calls in a sequential manner. After Answering the Question stop."""


class Tool:
    def __init__(self, name: str, description: str, func: Callable):
        self.name = name
        self.description = description
        self.func = func

    def __call__(self, **kwargs) -> Any:
        return self.func(**kwargs)

class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Tool] = {}
    
    def register(self, tool: Tool):
        self.tools[tool.name] = tool
    
    def get_tool(self, name: str) -> Tool:
        return self.tools.get(name)
    
    def get_tool_descriptions(self) -> str:
        descriptions = []
        for name, tool in self.tools.items():
            descriptions.append(f"Tool: {name}\nDescription: {tool.description}")

        # print(len(descriptions))

        if len(descriptions)==0:
            descriptions.append("No Tools Available")
        return "\n\n".join(descriptions)

def generate_until_pattern(model, tokenizer, initial_prompt, pattern, max_length=2048):
    # Get the EOS token ID
    eos_token_id = tokenizer.eos_token_id
    
    # Encode initial prompt
    input_ids = tokenizer.encode(initial_prompt, return_tensors='pt')
    
    output_tokens = copy.deepcopy(input_ids).to(device)
    # Create attention mask
    attention_mask = torch.ones_like(input_ids)
    
    # Prepare past key values (KV cache)
    past_key_values = None
    
    # Keep track of just the generated text separately
    generated_text = ""
    current_length = input_ids.shape[1]
    
    while current_length < max_length:
        # Generate next token with KV cache
        with torch.no_grad():
            outputs = model(
                input_ids=input_ids.to(device), 
                attention_mask=attention_mask.to(device),
                past_key_values=past_key_values
            )
            
            # Get logits and past key values
            logits = outputs.logits
            past_key_values = outputs.past_key_values
            
            # Get the last token's prediction
            next_token_logits = logits[0, -1, :]
            next_token_id = torch.argmax(next_token_logits).unsqueeze(0).unsqueeze(0)
            output_tokens = torch.cat([output_tokens, next_token_id], dim = -1)
            # Check for EOS token
            if next_token_id.item() == eos_token_id:
                return tokenizer.decode(output_tokens[0], skip_special_tokens = True), False, None
            
            # Decode the token
            next_token_text = tokenizer.decode(
                next_token_id[0],
                skip_special_tokens=True
            )
            generated_text += next_token_text
            for match in re.finditer(pattern, generated_text, re.DOTALL):
                # print(tokenizer.decode(output_tokens[0], skip_special_tokens = True))
                return tokenizer.decode(output_tokens[0], skip_special_tokens = True), True, (match.start(), match.end())
            # Update input_ids for next iteration
            input_ids = next_token_id
            attention_mask = torch.ones_like(input_ids)
            
            current_length += 1
    return tokenizer.decode(output_tokens[0], skip_special_tokens = True), False, None  # Return if max_length reached

class LLMToolCaller:
    def __init__(self, model, tokenizer, tool_registry: ToolRegistry):
        self.tokenizer = tokenizer
        self.model = model
        self.tool_registry = tool_registry

    def _extract_tool_calls(self, text: str) -> List[Dict]:
        tool_pattern = r'\{\s*"name"\s*:\s*"(.*?)"\s*,\s*"arguments"\s*:\s*\{(.*?)\}\s*\}'
        tool_calls = []
        for match in re.finditer(tool_pattern, text, re.DOTALL):
            tool_calls.append(json.loads(match.group()))

        return tool_calls

    def _execute_tool_calls(self, tool_calls: List[Dict]) -> List[Dict]:
        results = []

        for call in tool_calls:
            tool_name = call.get("name")
            arguments = call.get("arguments", {})

            tool = self.tool_registry.get_tool(tool_name)
            if tool:
                try:
                    result = tool() if not arguments else tool(**arguments)
                    results.append({
                        "tool": tool_name,
                        "status": "success",
                        "result": result
                    })
                except Exception as e:
                    results.append({
                        "tool": tool_name,
                        "status": "error",
                        "error": repr(e)
                    })
            else:
                results.append({
                    "tool": tool_name,
                    "status": "error",
                    "error": "Tool not found"
                })

        return results

    def generate_response(self, prompt: str, max_new_tokens: int = 2048) -> str:
        system_prompt = prompt_template(self.tool_registry.get_tool_descriptions())
        full_prompt = f"{system_prompt}\n\nUser: {prompt}\n\nAssistant:"
        flag = True
        while(flag):
            inputs = self.tokenizer(full_prompt, return_tensors="pt").to(self.model.device)
            response, flag, po = generate_until_pattern(self.model, self.tokenizer, full_prompt,
                                r'\{\s*"name"\s*:\s*"(.*?)"\s*,\s*"arguments"\s*:\s*\{(.*?)\}\s*\}')
            response = response[len(full_prompt):].strip()
            tool_calls = self._extract_tool_calls(response)
            if tool_calls:
                results = self._execute_tool_calls(tool_calls)
                full_prompt = f"{full_prompt}\n{response}\n\nTool Results:\n{json.dumps(results, indent=2)}"
        tool_results_prompt = f"{full_prompt}\n\nFinal Response: "
        inputs = self.tokenizer(tool_results_prompt, return_tensors="pt").to(self.model.device)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens = max_new_tokens,
            pad_token_id = self.tokenizer.eos_token_id,
            do_sample = False
        )
        final_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return final_response[len(tool_results_prompt):].strip()


bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True
        )
llmagent = pickle.load(open('/kaggle/working/llmagent.sav','rb')).to(device)
llmtokenizer = pickle.load(open('/kaggle/working/llmtokenizer.sav','rb'))
registry = ToolRegistry()

tool_caller = LLMToolCaller(llmagent, llmtokenizer, registry)
response = tool_caller.generate_response('what is the capital of france')
print(response)