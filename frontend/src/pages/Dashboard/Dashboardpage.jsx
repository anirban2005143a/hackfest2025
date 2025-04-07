import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import axios from "axios";
import Loader from "../../components/loader/Loader.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Delete, Trash2, User } from "lucide-react";
import AuthContext from "../../Context/Authcontext.js";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify"
import defaultUserImg from "/user.png"

function Dashboard() {

  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [click, setClick] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  const [expandedChat, setExpandedChat] = useState(null);
  const [name, setName] = useState("----");
  const [email, setEmail] = useState("----");

  const { isAuthenticated, setIsAuthenticated, verifyAuth } = useContext(AuthContext);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);


  const toggleChat = (chatId) => {
    setExpandedChat(expandedChat === chatId ? null : chatId);
  };
  const getchatHistory = async () => {
    setLoading(true);
    // console.log("get chat history");
    try {
      console.log("chat history");
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/getchathistory`,
        {
          user_id: localStorage.getItem("userid"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response?.data?.chat) {
        setData(response.data.chat);
        setLoading(false);
      }
      console.log(response);
    } catch (error) {
      setLoading(false);
      console.log("error in getting chat history");
      console.log(error);
    }
  };
  const deletechat = async (chatId) => {
    console.log("check changed");
    console.log(chatId);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/chat/deletechathistory`,
        {
          chatId: chatId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response?.data?.message);
      // alert(response?.data?.message);
      showToast(response?.data?.message, 0)
      getchatHistory();
    } catch (error) {
      console.log("error in deleting chat history");

      console.log(error);
    }
  };

  function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else {
      return "just now";
    }
  }

  const userinfo = async () => {
    try {
      const userid = localStorage.getItem("userid");
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/user/info`,
        {
          userid: userid,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log(response);
      if (response.status === 200) {
        setName(
          response.data.user.fullname.firstname +
          " " +
          response.data.user.fullname.lastname
        );
        setEmail(response.data.user.email);
      }
      console.log(response.data.name);
    } catch (error) {
      console.log(error);
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
  }

  useEffect(() => {
    if (isAuthenticated) {
      console.log("user info");
      userinfo();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    isAuthenticated && getchatHistory();
  }, [isAuthenticated]);


  useEffect(() => {
    if (isAuthenticated === false) navigate("/auth/login")
  }, [isAuthenticated])

  // console.log(data)

  return (
    <>
      <ToastContainer />
      {loading && <Loader />}
      {!isAuthenticated && <Loader />}
      {isAuthenticated && !loading && <div className="app dark-theme min-h-screen bg-gray-950 overflow-x-hidden">
        <Navbar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />

        <div className="md:h-screen h-auto flex flex-col md:flex-row gap-4 p-4 pt-24">
          <div className="w-full  md:h-full md:w-1/3 lg:w-1/4 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <div className="bg-gray-700 h-32 w-32 rounded-full mb-4 flex items-center justify-center">
              <img
                src={defaultUserImg}
                alt="User"
                className="h-32 w-32 rounded-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-white text-center">{name}</h2>
            <p className="text-gray-400 text-center mb-4">{email}</p>
          </div>

          <div className="w-full md:h-full flex flex-col md:flex-row gap-4">
            {/* chat history */}
            {isMobile ? (
              <>
                <div className="md:h-full overflow-y-auto flex-1 bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
                    Chat History
                  </h1>

                  <div className="space-y-2 sm:space-y-3">
                    {data.map((chat) => (
                      <motion.div
                        key={chat.chatId}
                        className="rounded-lg overflow-hidden"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Accordion Header */}
                        <motion.button
                          onClick={() => toggleChat(chat.chatId)}
                          className="w-full p-3 sm:p-4 bg-gray-700 text-white text-left"
                          whileHover={{ backgroundColor: "#374151" }}
                        >
                          <div className="flex justify-between items-center cursor-pointer">
                            <span className="font-medium text-sm sm:text-base">
                              {chat.title}
                            </span>
                            <motion.span
                              className="text-gray-400 text-xs sm:text-sm"
                              animate={{
                                rotate: expandedChat === chat.chatId ? 0 : -90,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              ▶
                            </motion.span>
                          </div>
                        </motion.button>

                        {/* Accordion Content */}
                        <AnimatePresence>
                          {expandedChat === chat.chatId && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
                                {chat.chatList.map((item, ind) => (
                                  <motion.div
                                    key={ind}
                                    className="space-y-2 sm:space-y-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: ind * 0.05 }}
                                  >
                                    {/* Question */}
                                    <motion.div
                                      className="bg-blue-900/30 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500 max-w-full overflow-hidden"
                                      whileHover={{ scale: 1.01 }}
                                    >
                                      <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="bg-blue-500 text-white p-1 rounded-full flex-shrink-0">
                                          <svg
                                            className="w-3 h-3 sm:w-4 sm:h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                          </svg>
                                        </div>
                                        <p className="text-white font-medium break-words whitespace-pre-wrap text-sm sm:text-base">
                                          {item.question}
                                        </p>
                                      </div>
                                    </motion.div>

                                    {/* Answer */}
                                    <motion.div
                                      className="bg-gray-700/50 p-3 sm:p-4 rounded-lg border-l-4 border-green-500 ml-6 sm:ml-8 max-w-full overflow-hidden"
                                      whileHover={{ scale: 1.01 }}
                                    >
                                      <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="bg-green-500 text-white p-1 rounded-full flex-shrink-0">
                                          <svg
                                            className="w-3 h-3 sm:w-4 sm:h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                          </svg>
                                        </div>
                                        <div className="text-gray-300 break-words whitespace-pre-wrap text-sm sm:text-base">
                                          {Array.isArray(item.answer) ? (
                                            item.answer.map((ans, ansIndex) => (
                                              <p
                                                key={ansIndex}
                                                className="mb-1 sm:mb-2 last:mb-0"
                                              >
                                                {ans}
                                              </p>
                                            ))
                                          ) : (
                                            <p>{item.answer}</p>
                                          )}
                                        </div>
                                      </div>
                                      <p className="text-gray-500 text-xs mt-1 sm:mt-2">
                                        {getTimeAgo(item.createdAt)}
                                      </p>
                                    </motion.div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 md:h-full overflow-y-auto bg-gray-800 rounded-lg shadow-lg p-6">
                  <h1 className="text-2xl font-bold text-white mb-6 text-center">
                    Chat History
                  </h1>
                  <div>
                    {click === -1 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 2 }}
                        className="text-gray-400 text-center py-10"
                      >
                        Select a chat from the sidebar to preview your history here
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        {[...data[data.length - 1 - click].chatList].reverse().map((item, ind) => (
                          <motion.div
                            key={ind}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ind * 0.1 }}
                            className="space-y-3"
                          >
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              className="bg-blue-900/30 p-4 rounded-lg border-l-4 border-blue-500"
                            >
                              <div className="flex items-start gap-3">
                                <div className="bg-blue-500 text-white p-1 rounded-full flex-shrink-0">
                                  <Bot />
                                </div>
                                <p className="text-white font-medium">
                                  {item.question}
                                </p>
                              </div>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-500 ml-8"
                            >
                              <div className="flex items-start gap-3">
                                <div className="bg-green-500 text-white p-1 rounded-full flex-shrink-0">
                                  <User size={20} />
                                </div>
                                <div className="text-gray-300">
                                  {Array.isArray(item.answer) ? (
                                    item.answer.map((ans, ansIndex) => (
                                      <p key={ansIndex} className="mb-2 last:mb-0">
                                        {ans}
                                      </p>
                                    ))
                                  ) : (
                                    <p>{item.answer}</p>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-500 text-xs mt-2">
                                {getTimeAgo(item.createdAt)}
                              </p>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Recent Activity Sidebar - Hidden on mobile */}
            <div className="w-full md:h-full overflow-y-auto md:w-1/4 bg-gray-800 rounded-lg shadow-lg p-6 hidden md:block">
              <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="space-y-4">
                  {[...data].reverse().map((item, index) => {
                    // console.log(item); // This will now work
                    return (
                      <div
                        key={item.id || index}
                        className="group relative border-l-2 border-blue-500 pl-4 hover:bg-gray-800/50 transition-colors rounded cursor-pointer"
                      >
                        <button
                          className="w-full text-left"
                          onClick={() => {
                            setClick(index);
                            console.log("clicked", index);
                          }}
                        >
                          <div className="flex items-center gap-5 justify-between cursor-pointer">
                            <div className="flex items-center ">
                              <p className="text-white text-sm">{item.title}</p>
                            </div>
                            <div className=" flex items-center">
                              <p className="text-gray-400 text-xs">
                                {getTimeAgo(item.createdAt)}
                              </p>
                              <button
                                className="text-gray-400 hover:text-red-400 p-2 -mr-2 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log("delete", index);
                                  deletechat(item.chatId);
                                }}
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </>
  );
}

export default Dashboard;
