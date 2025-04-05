import React, { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './Chatwindow';
import Navbar from '../../components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const ChatInterface = () => {

  const [isNavOpen, setIsNavOpen] = useState(window.innerWidth >= 640 ? true : false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isChatInfoFetching, setisChatInfoFetching] = useState(true)
  const mainRef = useRef(null);

  // console.log(selectedChat)

  return (
    <>
      <div id='chatInterface' className=' relative h-full '>
        <Navbar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        {/* Main content area */}

        <div className="workSpace pt-[80px] h-full">
          <div className="sm:flex sm:flex-row h-full">
            {/* navigation panel  */}
            <Sidebar
              isNavOpen={isNavOpen}
              setisChatInfoFetching={setisChatInfoFetching}
              setSelectedChatId={setSelectedChatId}
              selectedChatId={selectedChatId}
            />
            {/* chat window  */}
            <div
              ref={mainRef}
              className="h-full transition-all duration-150"
              style={{ width: window.innerWidth >= 768 ? isNavOpen ? "100%" : "100%" : "100%" }}
            >
              <ChatWindow
                isChatInfoFetching={isChatInfoFetching}
                setisChatInfoFetching={setisChatInfoFetching}
                setSelectedChatId={setSelectedChatId}
                selectedChatId={selectedChatId}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

export default ChatInterface;

