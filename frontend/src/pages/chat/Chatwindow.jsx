import React, { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Loader2, MicOff, Mic } from "lucide-react";
import { saveChatResponse } from "./functions/saveChat";
import { getChatInfo } from "./functions/getChatInfo";
import { getresponse } from "./functions/getanswer";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const ChatWindow = ({
  isChatInfoFetching,
  setisChatInfoFetching,
  setSelectedChatId,
  chatCount,
  selectedChatId,
}) => {
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [question, setquestion] = useState("");
  const [isFetching, setisFetching] = useState(false);
  const [answer, setanswer] = useState("");

  const [isReady, setisReady] = useState(true);

  const textareaRef = useRef(null);
  const massagesRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setisReady(false);
    const newMessage = {
      question: input,
      answer: [],
      // _id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setquestion(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isFetching && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Shift+Enter will naturally create a new line
  };

  //save chat question and answer to database
  const saveChat = async (question, answer, uniqueId, user_id, title) => {
    const data = await saveChatResponse(
      question,
      answer,
      uniqueId,
      user_id,
      title
    );
    console.log(data);
  };

  //function to get chat question-answer
  const getChatQueAns = async (chatId) => {
    const chats = await getChatInfo(chatId);
    setMessages(chats);

    console.log(chats);

    if (!chats || (chats && chats.length === 0)) {
      const res = await saveChatResponse(
        undefined,
        "How can i help you?",
        selectedChatId,
        localStorage.getItem("userid") || 123,
        localStorage.getItem("chatTitle")
      );
      if (res.error) {
        showToast(res.message, 1);
        return;
      }
      console.log(selectedChatId);
      const newMessage = {
        question: undefined,
        answer: ["How can i help you?"],
        // _id: uuidv4(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
    }

    setisChatInfoFetching(false);
  };

  const getAnswer = async (input) => {
    // const res = await getresponse(input);
    const res = await new Promise((res , rej)=>{
      setTimeout(() => {
        res("demo reponse from ai model")
      }, 1000);
    });
    console.log(res);
    
    const convertedText = convertToFormattedHTML(res);
    setanswer(convertedText);
  };

  // convert /n text to normal text
  function convertToFormattedHTML(escapedString) {
    return escapedString
      .replace(/\\n/g, "<br>") // Line breaks
      .replace(/\\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;") // Tabs as 4 spaces
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold**
      .replace(/_(.*?)_/g, "<em>$1</em>") // _italic_
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // *italic*
      .replace(/\\"/g, '"') // \" -> "
      .replace(/\\'/g, "'") // \' -> '
      .replace(/\\\\/g, "\\"); // \\ -> \
  }

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 150; // Maximum height before scrolling
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;

      // Show scrollbar if content exceeds max height
      if (textareaRef.current.scrollHeight > maxHeight) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [input]);

  useEffect(() => {
    if (answer) {
      saveChat(
        question,
        answer,
        selectedChatId,
        localStorage.getItem("userid") || "123",
        localStorage.getItem("chatTitle") || "New chat"
      );
      console.log(selectedChatId);
      const assistantMessage = {
        question: null,
        answer: [answer],
        // _id: uuidv4(),
        createdAt: new Date().toISOString(),
      };

      setquestion("");
      setanswer("");
      setisReady(true);
      setisFetching(false);
      setMessages((prev) => [...prev, assistantMessage]);
    }
  }, [answer]);

  useEffect(() => {
    if (question) {
      setisFetching(true);
      getAnswer(question);
    }
  }, [question]);

  useEffect(() => {
    if (massagesRef.current || isFetching) {
      massagesRef.current.scrollTop = massagesRef.current.scrollHeight;
    }
  }, [messages, isFetching]);

  useEffect(() => {
    selectedChatId && getChatQueAns(selectedChatId);
    selectedChatId && console.log(selectedChatId);
  }, [selectedChatId]);

  // adding voice recognition
  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setIsBrowserSupported(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInput((prev) => (prev + " " + finalTranscript).trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      stopListening();
    };

    return () => {
      if (recognition) recognition.stop();
    };
  }, []);

  const startListening = () => {
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const stopListening = () => {
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  // console.log(selectedChat)
  return (
    <>
      {!chatCount && (
        <div className=" w-full h-full flex justify-center items-center">
          <p className=" sm:text-2xl text-xl text-white text-center">
            Please create a chat
          </p>
        </div>
      )}
      {chatCount && (
        <div className="flex flex-col h-full  rounded-t-2xl">
          {/* Messages Container */}
          <div
            ref={massagesRef}
            className="flex-1 overflow-y-auto   p-4 space-y-4"
          >
            {isChatInfoFetching && (
              <div className=" h-full w-full flex justify-center items-center  ">
                <Loader2 size={50} color="blue" className=" animate-spin" />
              </div>
            )}

            {!isChatInfoFetching &&
              messages &&
              messages.map((message, ind) => {
                // Transform question messages (user role)
                return (
                  <div key={ind} className=" flex flex-col gap-4">
                    {/* Message Item */}
                    {message.question && (
                      <div className="flex justify-end">
                        <div className="flex gap-3 max-w-[80%] flex-row-reverse">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                            <User className="w-6 h-6 text-white bg-blue-600 rounded-full p-1" />
                          </div>
                          <div className="px-4 py-2 w-full bg-blue-600 text-white rounded-br-2xl rounded-l-2xl">
                            <p className="text-sm">{message.question}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.answer && message.answer.length > 0 && (
                      <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[80%] flex-row">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                            <Bot className="w-6 h-6 text-white bg-purple-600 rounded-full p-1" />
                          </div>
                          <div className="px-4 py-2 w-full bg-gray-800 text-gray-100 rounded-bl-2xl rounded-r-2xl">
                            <div className="text-sm">
                              {/* <ReactMarkdown>{message.answer[0]}</ReactMarkdown> */}
                              <ReactMarkdown children={message.answer[0]} rehypePlugins={[rehypeRaw]} />                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            {!isChatInfoFetching && isFetching && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%] flex-row">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                    <Bot className="w-6 h-6 text-white bg-purple-600 rounded-full p-1" />
                  </div>
                  <div className="px-4 py-2 w-full bg-gray-800 text-gray-100 rounded-bl-2xl rounded-r-2xl">
                    <div className=" flex items-center gap-3">
                      <p className="text-sm">Fetching...</p>
                      <Loader2 className=" animate-spin" />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  className="w-full py-2 px-3 pr-10 rounded-xl border border-gray-600 bg-gray-700 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors placeholder-gray-400 resize-none"
                  style={{
                    minHeight: "44px",
                    maxHeight: "150px",
                  }}
                />
                {isBrowserSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-12 bottom-2 p-1 cursor-pointer transition-colors ${
                      isListening
                        ? "text-red-400 hover:text-red-300"
                        : "text-gray-400 hover:text-blue-100"
                    }`}
                    disabled={!isReady}
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-4 bottom-2 p-1 text-gray-400 cursor-pointer hover:text-blue-100 transition-colors disabled:opacity-50"
                  disabled={!isReady || !input.trim()}
                  onClick={handleSubmit}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
