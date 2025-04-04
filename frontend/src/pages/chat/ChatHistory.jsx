import React from 'react';

const ChatHistory = ({ chats, activeChat, setActiveChat }) => {
  return (
    <div className="chat-history">
      <h3 className="history-title">Chat History</h3>
      <ul className="history-list">
        {chats.map(chat => (
          <li 
            key={chat.id} 
            className={`history-item ${activeChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => setActiveChat(chat)}
          >
            {chat.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatHistory;