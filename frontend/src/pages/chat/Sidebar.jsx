import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import { getChatHistory } from './functions/getChatHistory';
import Loader from '../../components/loader/Loader';
import axios from 'axios';

const Sidebar = ({ isNavOpen, setisChatInfoFetching, setSelectedChatId , selectedChatId }) => {
  const [allChats, setallChats] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [inputValue, setInputValue] = useState("");
  // const [selectedChatId, setSelectedChatId] = useState(null);
  const [isReady, setisReady] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Set initial selected chat (most recent one)
  useEffect(() => {
    if (allChats.length > 0 && !selectedChatId) {
      setSelectedChatId(allChats[0].chatId);
      localStorage.setItem("chatTitle", allChats[0].title);
      navigate(`/chat/${allChats[0].chatId}`);
    }
  }, [allChats.length, selectedChatId]);

  // Focus input when adding new chat
  useEffect(() => {
    if (isAddingNew && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingNew]);

  const handleAddClick = () => {
    setIsAddingNew(true);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      const name = inputValue.trim();
      saveChat(name);
    }
  };

  const saveChat = (name) => {
    if (!name) {
      showToast("Chat name cannot be empty", 1);
      return;
    }

    if (name !== "New chat" && allChats.some(chat => chat.title.toLowerCase() === name.toLowerCase())) {
      showToast("A chat with this name already exists", 1);
      return;
    }

    const newChat = {
      title: name,
      chatId: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    setallChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.chatId);
    // setselectedChat([]);
    localStorage.setItem("chatTitle", newChat.title);
    navigate(`/chat/${newChat.chatId}`);
    setIsAddingNew(false);
    setInputValue("");
  };

  const handleDeleteChat = async (id) => {
    if (!id) {
      alert("Chat ID is required to delete a chat");
      return;
    }
    
    try {
      const response = await axios.post(
        "http://localhost:3000/api/chat/deletechathistory",
        {
          chatId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      showToast(response?.data?.message, 0);
      handelDeletechatFromArray(id);
    } catch (error) {
      showToast(error.response?.data?.message || error.message, 1);
    }
  };

  const handleChatClick = (chatId, chatList, title) => {
    setSelectedChatId(chatId);
    setisChatInfoFetching(true)
    // setselectedChat(chatList || []);
    localStorage.setItem("chatTitle", title);
  };

  const sortedChats = [...allChats].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const ChatHistory = async () => {
    try {
      setisReady(false);
      const data = await getChatHistory(localStorage.getItem("userid"));
      if (!data.error) {
        if (data.chat.length > 0) {
          setSelectedChatId(data.chat[data.chat.length - 1].chatId);
        if (data.chat.length > 0)
          // setselectedChat(data.chat[data.chat.length - 1].chatList);

        setallChats(data.chat);
        if (data.chat.length === 0) saveChat("New chat");
      } else {
        showToast(data.message, 1);
      }
    } }catch (error) {
      showToast(error.response?.data?.message || error.message, 1);
    } finally {
      setisReady(true);
    }
  };

  const showToast = (message, err) => {
    if (err) {
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handelDeletechatFromArray = (id) => {
    setallChats((prev) => prev.filter((chat) => chat.chatId != id));
  };

  useEffect(() => {
    if (selectedChatId) {
      navigate(`/chat/${selectedChatId}`);
    }
  }, [selectedChatId]);

  useEffect(() => {
    ChatHistory();
  }, []);

  // console.log(allChats)
  return (
    <>
      <ToastContainer />
      {!isReady && <Loader />}
      {isReady && (
        <div
          id="sidebar"
          className={`
            z-10
            fixed sm:relative h-full bg-slate-900 overflow-x-hidden rounded-tr-2xl
            transition-all duration-300 ease-in-out
            ${isNavOpen ? "left-0" : "-left-full sm:left-0"}
          `}
          style={{
            width: window.innerWidth >= 640 ? (isNavOpen ? "400px" : "0%") : "80%",
          }}
        >
          <div
            className={`
              p-4 flex flex-col overflow-x-hidden overflow-y-auto h-full
              transition-opacity duration-300
              ${isNavOpen ? "opacity-100" : "opacity-0 sm:opacity-100"}
            `}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-md font-semibold text-white">Your chat</h2>
              <button
                onClick={handleAddClick}
                disabled={isAddingNew}
                className={`px-2 py-1.5 bg-slate-800 text-white rounded hover:bg-slate-800/80 cursor-pointer ${
                  isAddingNew ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="my-4 h-full overflow-y-auto">
              <ul className="space-y-2 text-white">
                {isAddingNew && (
                  <li className="p-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder="Enter chat name"
                      className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                    />
                  </li>
                )}
                {sortedChats.map((chat, ind) => (
                  <li
                    key={ind}
                    className={`group flex items-center justify-between p-1 rounded hover:bg-gray-800 ${
                      selectedChatId === chat.chatId ? "bg-gray-700" : ""
                    }`}
                    onClick={() =>
                      handleChatClick(chat.chatId, chat.chatList, chat.title)
                    }
                  >
                    <span
                      className={`flex-1 truncate px-2 py-1 ${
                        selectedChatId === chat.chatId ? "font-medium" : ""
                      }`}
                    >
                      {chat.title}
                    </span>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={(e) => {
                          handleDeleteChat(chat.chatId);
                          e.stopPropagation();
                        }}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;