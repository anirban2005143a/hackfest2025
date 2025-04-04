import React, { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './Chatwindow';
import Navbar from '../../components/Navbar';

const ChatInterface = () => {

  const [isNavOpen, setIsNavOpen] = useState(window.innerWidth >= 640 ? true : false);

  const mainRef = useRef(null);

  return (
    <>
      <div id='chatInterface' className=' relative h-full '>
        <Navbar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        {/* Main content area */}

        <div className="workSpace pt-[70px] h-full">
          <div className="sm:flex sm:flex-row   h-full">
            {/* navigation panel  */}
            <Sidebar
              isNavOpen={isNavOpen}
              setIsNavOpen={setIsNavOpen}
            />
            {/* chat window  */}
            <div
              ref={mainRef}
              className="h-full transition-all duration-150"
              style={{ width: window.innerWidth >= 768 ? isNavOpen ? "80%" : "100%" : "100%" }}
            >
              <ChatWindow />
            </div>
          </div>
        </div>
      </div>
    </>
  )
};

export default ChatInterface;

