import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import DropdownMenu from "./Dropdown.jsx";
import { useContext } from "react";
import { User } from "lucide-react";
import AuthContext from "../Context/Authcontext.js";
const Navbar = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomId, setroomId] = useState("");
  const [inroomId, setinroomId] = useState("");
  const [check, setCheck] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const UserdropdownRef = useRef(null);
  const navigate = useNavigate();
  const toggleUserDropdown = () => {
    setIsOpen(!isOpen);
  };
  const [isLogin, setIslogin] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  useEffect(() => {
    isModalOpen
      ? (document.body.style.overflow = "hidden")
      : (document.body.style.overflow = "auto");
  }, [isModalOpen]);
  
  return (
    <>
      <nav
        id="navbar"
        className="fixed top-0 left-0 w-full z-50 border-gray-200 "
      >
        <div className="w-full flex items-center justify-between p-4">
          <Link to="/" className=" cursor-pointer flex items-center ">
            <img
              src="https://media.gettyimages.com/id/1129909544/vector/html-editor-glitch-effect-vector-icon-illustration.jpg?s=612x612&w=0&k=20&c=2_TWVXKmiYAFtneK9cYUvmmi1GlAe37Og0wYw8vVLMU="
              className="h-8"
              alt="Flowbite Logo"
            />
            <span className="self-center sm:block hidden text-2xl font-semibold whitespace-nowrap dark:text-white">
              AI
            </span>
          </Link>

          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-user"
          >
            <ul className="flex z-50 relative flex-col font-medium p-4 md:p-0 mt-4 border md:bg-transparent bg-stone-900 border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0  ">
              <li>
                <Link
                  to="/"
                  className={`block py-2 px-3 ${
                    window.location.pathname === "/"
                      ? " dark:text-blue-500 text-blue-700 "
                      : " text-white "
                  } rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0  md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 cursor-pointer`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`block py-2 px-3 ${
                    window.location.pathname === "/about"
                      ? " dark:text-blue-500 text-blue-700 "
                      : " text-white "
                  } rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0  md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 cursor-pointer`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/editor"
                  className={`block py-2 px-3 ${
                    window.location.pathname === "/editor"
                      ? " dark:text-blue-500 text-blue-700 "
                      : " text-white "
                  } rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0  md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700 cursor-pointer`}
                >
                  Editor
                </Link>
              </li>
            </ul>
          </div>

          {/* user profile  */}
          {/* from this part it is not reflecting in the ui like the user image in whcihc click two option appears sign in and signup */}
          <div className="relative md:order-2 px-5">
            <button
              onClick={toggleUserDropdown}
              className=" text-slate-200 px-4 py-2 rounded-lg cursor-pointer transition-colors "
            >
              <User />
            </button>

            {isOpen && (
              <div
                ref={UserdropdownRef}
                className="absolute -translate-x-8 mt-2 px-2 w-[120px] bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50"
              >
                <ul className="py-2">
                  {isAuthenticated ||
                  localStorage.getItem("islogin") === "true" ? (
                    <>
                      <li>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="block rounded-sm px-4 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/"
                          onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                            setIsOpen(false);
                            // Consider adding: window.location.reload() or context logout
                          }}
                          className="block rounded-sm px-4 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          Logout
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          to="/auth/login"
                          onClick={() => setIsOpen(false)}
                          className="block rounded-sm px-4 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          Sign In
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/auth/signup"
                          onClick={() => setIsOpen(false)}
                          className="block rounded-sm px-4 py-2 text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          Sign Up
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[5px] bg-[#2020236b] z-50">
          <div className="bg-[#4b5563] p-8 rounded-lg shadow-2xl md:w-[600px] w-[97%] transform transition-all duration-300 ease-in-out hover:scale-100">
            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="h-10 w-10 cursor-pointer text-white text-center rounded-full hover:bg-gray-700 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                  className="h-6 w-6 mx-auto"
                >
                  <path
                    fill="currentColor"
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  />
                </svg>
              </button>
            </div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-white">Collaborate</h2>
            </div>

            <div className="flex justify-center gap-12 mt-5 mb-8">
              <button
                type="button"
                onClick={handleCreateRoom}
                className="text-white cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Generate a Room Id
              </button>
              <button
                type="button"
                onClick={handleEnterRoom}
                className="text-white cursor-pointer bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Enter a Room Id
              </button>
            </div>

            <div className="text-center">
              {check === "create" ? (
                <>
                  <div className="text-white font-bold text-2xl mb-4">
                    Room ID: {roomId}
                  </div>
                  <div className="flex justify-center items-center gap-12 h-full mt-4 cursor-pointer">
                    <div className=" p-[4px] rounded-[16px]">
                      <button
                        onClick={() => {
                          navigate(`/editor?${roomId}`);
                        }}
                        type="button"
                        className="text-white cursor-pointer bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                      >
                        Enter the Room
                      </button>
                    </div>
                  </div>
                </>
              ) : check === "enter" ? (
                <div className="flex flex-col items-center gap-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log(roomId.length, roomId);
                      if (roomId.length === 11) {
                        navigate(`/editor?${roomId}`);
                      } else {
                        toast.error("Enter Valid room id", {
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
                    }}
                    className="flex flex-col justify-center items-center max-w-sm mx-auto"
                  >
                    <label htmlFor="simple-search" className="sr-only">
                      Search
                    </label>
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 18 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        autoComplete="off"
                        onChange={(e) => {
                          setroomId(e.target.value.trim());
                        }}
                        id="simple-search"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search branch name..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className=" m-3 cursor-pointer text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                    >
                      Join Room
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
          <ToastContainer />
        </div>
      )}
    </>
  );
};

export default Navbar;
