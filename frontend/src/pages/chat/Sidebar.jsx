import React, { useState, useRef, useEffect } from "react";
import { Plus, MoreVertical, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { getChatHistory } from "./functions/getChatHistory";
import Loader from "../../components/loader/Loader";
import axios from "axios";

const Sidebar = ({ isNavOpen, setIsNavOpen, setselectedChat }) => {
  const [allChats, setallChats] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isReady, setisReady] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Set initial selected chat (most recent one)
  useEffect(() => {
    if (allChats.length > 0 && !selectedChatId) {
      setSelectedChatId(allChats[0].chatId);
      // setselectedChat(allChats[allChats.length - 1].chatList);
      localStorage.setItem("chatTitle", allChats[0].title);
      navigate(`/chat/${allChats[0].chatId}`);
    }
  }, [allChats, selectedChatId, navigate]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isAddingNew &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsAddingNew(false);
        setInputValue("");
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddingNew]);

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
      alert("Chat name cannot be empty");
      return;
    }

    // Check for duplicate names
    if (
      name !== "New chat" &&
      allChats.some((chat) => chat.title.toLowerCase() === name.toLowerCase())
    ) {
      alert("A chat with this name already exists");
      return;
    }

    const newChat = {
      title: name,
      chatId: uuidv4(), // Unique ID as string
      createdAt: new Date().toISOString(),
    };

    // Add new chat to the top of the list
    setallChats((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.chatId);
    setselectedChat([]);
    localStorage.setItem("chatTitle", newChat.title);
    navigate(`/chat/${newChat.chatId}`);
    setIsAddingNew(false);
    setInputValue("");
  };

  const radnomdata = async () => {
    // console.log("get chat history");
    try {
      console.log("chat history");
      const response = await axios.post(
        "http://localhost:3000/api/chat/getchathistory",
        {
          user_id: localStorage.getItem("userid"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      if (response?.data?.chat) {
        setallChats(response.data.chat);
      }
      console.log(response);
    } catch (error) {
      console.log("error in getting chat history");
      console.log(error);
    }
  };


  const handleDeleteChat = async (id) => {
    if (!id) {
      alert("Chat ID is required to delete a chat");
      return;
    }
    console.log(id);
    setDropdownOpen(null);
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
    alert(response?.data?.message);
    radnomdata();
  };

  const handleRenameChat = (id, currentName) => {
    const newName = prompt("Rename chat", currentName);
    if (newName && newName.trim() !== currentName) {
      setallChats((prev) =>
        prev.map((chat) =>
          chat.chatId === id ? { ...chat, name: newName.trim() } : chat
        )
      );
    }
  };

  const handleChatClick = (chatId, chatList, title) => {
    setSelectedChatId(chatId);
    setselectedChat(chatList || []);
    localStorage.setItem("chatTitle", title);
    navigate(`/chat/${chatId}`);
    // setIsNavOpen(!isNavOpen);
  };

  // Sort chats by creation date (newest first)
  const sortedChats = [...allChats].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  //chat history
  const ChatHistory = async () => {
    // console.log("dfbshfb")
    try {
      setisReady(false);
      const data = await getChatHistory(localStorage.getItem("userid"));
      console.log(data);
      if (!data.error) {
        if (data.chat.length > 0)
          setSelectedChatId(data.chat[data.chat.length - 1].chatId);
        if (data.chat.length > 0)
          setselectedChat(data.chat[data.chat.length - 1].chatList);

        setallChats(data.chat);
        if (data.chat.length === 0) saveChat("New chat");
      } else {
        console.log(data);
        showToast(data.message, true);
      }
    } catch (error) {
      console.log(error);
      showToast(error.message, true);
    } finally {
      setisReady(true);
    }
  };

  //function to show alert
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

  useEffect(() => {
    ChatHistory();
  }, []);

  // console.log(allChats);
  return (
    <>
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
            width:
              window.innerWidth >= 640 ? (isNavOpen ? "20%" : "0%") : "80%",
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
                {sortedChats.map((chat, ind) => {
                  // console.log(chat)
                  return (
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
                        <button className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Trash
                            size={16}
                            onClick={(e) => {
                              handleDeleteChat(chat.chatId);
                              e.stopPropagation(); // Prevent triggering the parent click event
                            }}
                          />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
