import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      role: 'assistant',
    },
  ]);
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: 'This is a simulated response. The actual integration with an AI model would go here.',
        role: 'assistant',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Shift+Enter will naturally create a new line
  };

  //save chat question and answer to database
  const saveChat = async (question, answer, uniqueId, user_id, title) => {
    const apiUrl = `${import.meta.env.VITE_REACT_APP_API_URL}/api/savechathistory`

    const requestBody = {
      question: question,
      answer: answer,
      uniqueId: uniqueId,
      user_id: localStorage.getItem("userId"),
      title: title,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Success:", result.message);
        return result;
      } else {
        console.error("Error:", result.message);
        return result;
      }
    } catch (error) {
      console.error("Error:", error.message);
      return { error: true, message: error.message };
    }
  }

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 150; // Maximum height before scrolling
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;

      // Show scrollbar if content exceeds max height
      if (textareaRef.current.scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [input]);


  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                {message.role === 'assistant' ? (
                  <Bot className="w-6 h-6 text-white bg-purple-600 rounded-full p-1" />
                ) : (
                  <User className="w-6 h-6 text-white bg-blue-600 rounded-full p-1" />
                )}
              </div>
              <div
                className={`px-4 py-2 w-full over  ${message.role === 'assistant'
                  ? 'bg-gray-800 text-gray-100 rounded-bl-2xl rounded-r-2xl'
                  : 'bg-blue-600 text-white rounded-br-2xl rounded-l-2xl'
                  }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-700 bg-gray-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              rows="1"
              className="w-full p-2 pr-10 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors placeholder-gray-400 resize-none"
              style={{
                minHeight: '44px',
                maxHeight: '150px',
              }}
            />
            <button
              type="submit"
              className="absolute right-4 bottom-2 p-1 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ChatWindow;