
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import logoImg from '/vite.svg';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Settings, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import defaultUserImg from "/user.png"

const Navbar = ({ setIsNavOpen, isNavOpen }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const menuRef = useRef(null);
    const logoImgRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const logoBorderMobileRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    let lastScrollY = window.scrollY;

    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navigate = useNavigate()

    // const toggleMobileMenu = () => {
    //     setIsMenuOpen(!isMenuOpen);
    // };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setIsVisible(false); // Hide on scroll down
            } else {
                setIsVisible(true); // Show on scroll up
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsDropdownOpen(false);
    };


    const UserDropdown = () => (
        <div className=" " ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className=" cursor-pointer flex items-center space-x-2 bg-gray-700 rounded-full p-1 hover:bg-gray-600 transition-colors duration-200"
            >
                <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-blue-400 flex items-center justify-center overflow-hidden">
                    <img
                        src={defaultUserImg}
                        alt="User"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = '';
                            e.target.parentElement.innerHTML = '<User className="w-5 h-5 text-gray-400" />';
                        }}
                    />
                </div>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-700">
                    {isLoggedIn ? (
                        <>
                            <div 
                                onClick={() => {
                                    setIsDropdownOpen(false)
                                    navigate("/profile")
                                }}
                                className=" px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Profile</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                setIsDropdownOpen(false)
                                navigate("/auth/login")
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );



    // GSAP animation for mobile menu
    useEffect(() => {
        if (isMenuOpen) {
            // Slide in the menu from the right
            gsap.fromTo(
                menuRef.current,
                { x: '100%', opacity: 0 },
                { x: '0%', opacity: 1, duration: 0.5 }
            );

            gsap.fromTo(document.querySelectorAll('.nav-menu-mobile'), {
                x: 100,
                opacity: 0
            }, {
                x: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.2,
                delay: 0.2,

            })
        } else {
            // Slide out the menu to the right
            gsap.to(menuRef.current, {
                x: '100%',
                opacity: 0,
                duration: 0.5,
            });
        }
    }, [isMenuOpen]);



    return (
        <motion.nav
            className="fixed w-full z-10 h-[60px] "
            initial={{ y: 0 }}
            animate={{ y: isVisible ? 0 : '-100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
            <div className=" container mx-auto px-4 max-w-7xl ">
                {/* Desktop Navbar */}
                <div className="max-w-7xl md:block hidden mx-auto ">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex gap-4 items-center">
                            <Link to='/'>
                                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    AI
                                </span>
                            </Link>
                            {window.location.pathname.includes("/chat") && <button
                                onClick={() => {
                                    setIsNavOpen(!isNavOpen);
                                }}
                                className=" cursor-pointer  text-white px-4 py-2 rounded-lg shadow-lg"
                            >
                                {isNavOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
                            </button>}
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/about" className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                About
                            </Link>
                            <Link to="/feeback" className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                Contact
                            </Link>
                            <UserDropdown />
                        </div>


                    </div>
                </div>

                {/* Mobile Navbar */}
                <div className="md:hidden flex justify-between items-center py-4">
                    <div className=' flex items-center justify-between  '>
                        {/* Logo on the left */}
                        <Link to='/'>
                            <div className="h-12 w-12  p-1.5 mx-2 relative flex items-center justify-center">
                                <div
                                    ref={logoBorderMobileRef}
                                    className="absolute inset-0 border-[1px] w-full h-full  rounded-full transform "
                                />
                                <img
                                    ref={logoImgRef}
                                    src={logoImg}
                                    alt="Logo"
                                    className="w-full h-full relative   "
                                />
                            </div>
                        </Link>

                        {window.location.pathname.includes("/chat") && <button
                            onClick={() => {
                                setIsNavOpen(!isNavOpen);
                            }}
                            // onBlur={() => {
                            //     setIsNavOpen(false)
                            // }}
                            className=" cursor-pointer  text-white px-4 py-2 rounded-lg shadow-lg"
                        >
                            {isNavOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
                        </button>}
                    </div>

                    <div className=' flex items-center gap-4'>
                        <UserDropdown />

                        {/* Toggle Button */}
                        <button
                            ref={toggleButtonRef}
                            onClick={() => {
                                // console.log(menuRef.current)
                                setIsMenuOpen(!isMenuOpen)
                            }}
                            className="text-white cursor-pointer focus:outline-none"
                        >
                            <svg
                                className="w-10 h-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    ref={menuRef}
                    className={`${isMenuOpen ? "" : "hidden "} md:hidden fixed top-0 right-0 h-screen w-screen  bg-[#00000084] backdrop-blur-sm shadow-lg `}
                >
                    <div className="px-10 pt-[50px] h-full">
                        <button
                            onClick={() => {
                                setIsMenuOpen(false)
                            }}
                            className="text-white cursor-pointer focus:outline-none"
                        >
                            <svg
                                className="w-10 h-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <div className=' flex flex-col items-start gap-10  pt-[20px] text-white'>
                            <Link to='/#' className="text-white hover:underline hover:underline-offset-4  nav-menu-mobile">Ask AI</Link>
                            <Link to='/#' className="text-white hover:underline hover:underline-offset-4  nav-menu-mobile">About</Link>
                            <Link to='/#' className="text-white hover:underline hover:underline-offset-4  nav-menu-mobile">Feedback</Link>
                            <Link to='/#' className="text-white hover:underline hover:underline-offset-4  nav-menu-mobile">Log out</Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;