import React, { useRef, useState } from 'react';
import { gsap } from 'gsap';

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
   
  };

  return (
    <div className="relative md:order-2">
      <button
        onClick={toggleDropdown}
        className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors "
      >
        Menu
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg"
        >
          <ul className="py-2">
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Option 1
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Option 2
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Option 3
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;