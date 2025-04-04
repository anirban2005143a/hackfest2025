import React, { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './Chatwindow';
import Navbar from '../../components/Navbar';

const ChatInterface = () => {

  const [addedLinks, setAddedLinks] = useState({});
  const [selectedLink, setSelectedLink] = useState(null);
  const [newlyAddedLink, setnewlyAddedLink] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(true);

  const mainRef = useRef(null);

  const toggleNav = () => {
    
  };

  return (
    <>
      <div id='chatInterface' className=' relative h-full '>
        <Navbar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
        {/* Main content area */}

        <div className="workSpace pt-[70px] h-full">
          <div className="flex md:flex-row flex-col h-full">
            {/* navigation panel  */}
            <Sidebar
              selectedLink={selectedLink}
              setSelectedLink={setSelectedLink}
              isNavOpen={isNavOpen}
              addedLinks={addedLinks}
              setAddedLinks={setAddedLinks}
              newlyAddedLink={newlyAddedLink}
              setnewlyAddedLink={setnewlyAddedLink}
            />
            {/* editor  */}
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
