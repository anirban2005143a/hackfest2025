import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

const Sidebar = (props) => {
  const [allChats, setallChats] = useState([])

  const handelAddNewChat = () => {
    setallChats((prevChats) => [...prevChats, "New chat"]);
  }

  return (
    <div
      className="h-full bg-slate-900 transition-all duration-150 overflow-x-hidden rounded-tr-2xl"
      style={{ width: window.innerWidth >= 768 ? props.isNavOpen ? "20%" : "0%" : "100%" }}
    >
      <div className="p-4 flex flex-col  transition-all duration-50 overflow-x-hidden overflow-y-auto h-full " style={{ opacity: props.isNavOpen ? "1" : "0" }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Your chat</h2>
          <button onClick={handelAddNewChat} className="px-2 py-1.5 bg-slate-800 text-white rounded hover:bg-slate-800/80 cursor-pointer">
            <Plus />
          </button>
        </div>
        <div className='my-4  h-full overflow-y-auto'>
          <ul className="space-y-2 text-white  ">
            {allChats.map((chatName, index) => (
              <li
                key={index}
                className={` cursor-pointer `}
              >
                <a href="#" className="block p-2 rounded bg-gray-700">
                  {chatName}
                </a>
              </li>
            ))}

          </ul>
        </div>
      </div>


    </div>
  );
};

export default Sidebar;