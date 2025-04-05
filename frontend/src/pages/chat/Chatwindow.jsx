import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { saveChatResponse } from './functions/saveChat';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from 'react-router-dom';

const ChatWindow = ({ selectedChat, setselectedChat }) => {
  const [messages, setMessages] = useState(selectedChat || []);
  const [input, setInput] = useState('');
  const [question, setquestion] = useState("")
  // const [answer, setanswer] = useState("")

  const [isReady, setisReady] = useState(false)

  const textareaRef = useRef(null);
  const massagesRef = useRef(null);
  const params = useParams()


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setisReady(false)
    const newMessage = {
      question: input,
      answer: [],
      _id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setquestion(input)
    setInput('');
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
    const data = await saveChatResponse(question, answer, uniqueId, user_id, title);
    console.log(data);
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

  //save question and answer to database when answer is received
  // useEffect(() => {
  //   if (answer) {

  //     setquestion("")
  //     setanswer("")
  //   }
  // }, [answer])

  useEffect(() => {
    if (question) {
      // Simulate assistant response
      const response = 'This is a simulated response. The actual integration with an AI model would go here.'
      // setanswer(response)
      
      saveChat(question, response, params.chatId, localStorage.getItem("userid") || "123", localStorage.getItem("chatTitle") || "New chat")
      const assistantMessage = {
        question: null,
        answer: [response],
        _id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      setquestion("")
      // setanswer("")
      setMessages((prev) => [...prev, assistantMessage]);

    }
  }, [question])


  useEffect(() => {
    setMessages(selectedChat)
  }, [selectedChat])

  useEffect(() => {
    if (massagesRef.current) {
      massagesRef.current.scrollTop = massagesRef.current.scrollHeight;
    }
  }, [messages])


  // console.log(messages)
  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div ref={massagesRef} className="flex-1 overflow-y-auto   p-4 space-y-4">

        {messages && messages.map((message, ind) => {
          // Transform question messages (user role)       
          return (
            <div key={ind} className=' flex flex-col gap-4'>
              {/* Message Item */}
              {message.question && <div className="flex justify-end">
                <div className="flex gap-3 max-w-[80%] flex-row-reverse">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                    <User className="w-6 h-6 text-white bg-blue-600 rounded-full p-1" />
                  </div>
                  <div className="px-4 py-2 w-full bg-blue-600 text-white rounded-br-2xl rounded-l-2xl">
                    <p className="text-sm">{message.question}</p>
                  </div>
                </div>
              </div>}

              {message.answer && message.answer.length > 0 && <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%] flex-row">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-gray-700">
                    <Bot className="w-6 h-6 text-white bg-purple-600 rounded-full p-1" />
                  </div>
                  <div className="px-4 py-2 w-full bg-gray-800 text-gray-100 rounded-bl-2xl rounded-r-2xl">
                    <p className="text-sm">{message.answer[0]}</p>
                  </div>
                </div>
              </div>
              }
            </div>
          );


        })}
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
              disabled={!isReady || !input.trim()}
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