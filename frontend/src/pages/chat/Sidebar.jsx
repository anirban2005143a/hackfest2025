import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Sidebar = (props) => {
  const [allChats, setallChats] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Set initial selected chat (most recent one)
  useEffect(() => {
    if (allChats.length > 0 && !selectedChatId) {
      setSelectedChatId(allChats[0].id);
      navigate(`/chat/${allChats[0].id}`);
    }
  }, [allChats, selectedChatId, navigate]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAddingNew && inputRef.current && !inputRef.current.contains(event.target)) {
        setIsAddingNew(false);
        setInputValue('');
      }
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    if (e.key === 'Enter') {
      saveChat();
    }
  };

  const saveChat = () => {
    const name = inputValue.trim();
    
    if (!name) {
      alert('Chat name cannot be empty');
      return;
    }

    // Check for duplicate names
    if (allChats.some(chat => chat.name.toLowerCase() === name.toLowerCase())) {
      alert('A chat with this name already exists');
      return;
    }

    const newChat = {
      name,
      id: uuidv4(), // Unique ID as string
      createdAt: new Date().toISOString()
    };

    // Add new chat to the top of the list
    setallChats(prev => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    navigate(`/chat/${newChat.id}`);
    setIsAddingNew(false);
    setInputValue('');
  };

  const handleDeleteChat = (id) => {
    setallChats(prev => prev.filter(chat => chat.id !== id));
    setDropdownOpen(null);
    
    // If deleting the selected chat, select the most recent one
    if (selectedChatId === id && allChats.length > 1) {
      const remainingChats = allChats.filter(chat => chat.id !== id);
      setSelectedChatId(remainingChats[0].id);
      navigate(`/chat/${remainingChats[0].id}`);
    }
  };

  const handleRenameChat = (id, currentName) => {
    const newName = prompt('Rename chat', currentName);
    if (newName && newName.trim() !== currentName) {
      setallChats(prev => prev.map(chat => 
        chat.id === id ? { ...chat, name: newName.trim() } : chat
      ));
    }
  };

  const handleChatClick = (chatId) => {
    setSelectedChatId(chatId);
    navigate(`/chat/${chatId}`);
    props.setIsNavOpen(!props.isNavOpen);
  };

  // Sort chats by creation date (newest first)
  const sortedChats = [...allChats].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div
      id="sidebar"
      className={`
        z-10
        fixed sm:relative h-full bg-slate-900 overflow-x-hidden rounded-tr-2xl
        transition-all duration-300 ease-in-out
        ${props.isNavOpen ? 'left-0' : '-left-full sm:left-0'}
      `}
      style={{ 
        width: window.innerWidth >= 640 ? props.isNavOpen ? "20%" : "0%" : "80%" 
      }}
    >
      <div 
        className={`
          p-4 flex flex-col overflow-x-hidden overflow-y-auto h-full
          transition-opacity duration-300
          ${props.isNavOpen ? 'opacity-100' : 'opacity-0 sm:opacity-100'}
        `}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-md font-semibold text-white">Your chat</h2>
          <button 
            onClick={handleAddClick} 
            disabled={isAddingNew}
            className={`px-2 py-1.5 bg-slate-800 text-white rounded hover:bg-slate-800/80 cursor-pointer ${
              isAddingNew ? 'opacity-50 cursor-not-allowed' : ''
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
            {sortedChats.map((chat) => (
              <li
                key={chat.id}
                className={`group flex items-center justify-between p-1 rounded hover:bg-gray-800 ${
                  selectedChatId === chat.id ? 'bg-gray-700' : ''
                }`}
                onClick={() => handleChatClick(chat.id)}
              >
                <span className={`flex-1 truncate px-2 py-1 ${
                  selectedChatId === chat.id ? 'font-medium' : ''
                }`}>
                  {chat.name}
                </span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(dropdownOpen === chat.id ? null : chat.id);
                    }}
                    className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {dropdownOpen === chat.id && (
                    <div className="absolute right-0 z-20 mt-1 w-32 bg-gray-800 rounded shadow-lg">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameChat(chat.id, chat.name);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-700"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this chat?')) {
                            handleDeleteChat(chat.id);
                          }
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-700 text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;