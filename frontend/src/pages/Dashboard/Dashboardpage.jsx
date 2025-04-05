import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar.jsx";
import axios from "axios";
import Loader from "../../components/loader/Loader.jsx";
import { motion, AnimatePresence } from "framer-motion";
function Dashboard() {
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [click, setClick] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);
  const [expandedChat, setExpandedChat] = useState(null);

  const toggleChat = (chatId) => {
    setExpandedChat(expandedChat === chatId ? null : chatId);
  };
  const getchatHistory = async () => {
    setLoading(true);
    console.log("get chat history");
    try {
      console.log("chat history");
      const response = await axios.post(
        "http://localhost:3000/api/chat/getchathistory",
        {
          user_id: "67efbb1c8410de7ba2ab3e03",
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
  
  useEffect(() => {
    getchatHistory();
  }, []);
  return (
    <div className="app dark-theme min-h-screen bg-gray-950 flex flex-col">
      <Navbar isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />

      <div className="flex flex-1 flex-col md:flex-row gap-4 p-4 pt-24">
        <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
          <div className="bg-gray-700 h-32 w-32 rounded-full mb-4 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-xl font-bold text-white text-center">
            User Name
          </h2>
          <p className="text-gray-400 text-center mb-4">user@example.com</p>

          <div className="w-full mt-4 space-y-2">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition cursor-pointer">
              Edit Profile
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition">
              Settings
            </button>
          </div>
        </div>
        {/* chat history */}
        {isMobile ? (
          <>
            <div className="flex-1 bg-gray-800 rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-white mb-6 text-center">
                Chat History
              </h1>

              <div className="space-y-3">
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
                      className="w-full p-4 bg-gray-700 text-white text-left"
                      whileHover={{ backgroundColor: "#374151" }} // gray-700 on hover
                    >
                      <div className="flex justify-between items-center cursor-pointer">
                        <span className="font-medium ">{chat.title}</span>
                        <motion.span
                          className="text-gray-400"
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
                          <div className="p-4 space-y-4">
                            {chat.chatList.map((item, ind) => (
                              <motion.div
                                key={ind}
                                className="space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: ind * 0.05 }}
                              >
                                {/* Question */}
                                <motion.div
                                  className="bg-blue-900/30 p-4 rounded-lg border-l-4 border-blue-500"
                                  whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="bg-blue-500 text-white p-1 rounded-full flex-shrink-0">
                                      <svg
                                        className="w-4 h-4"
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
                                    <p className="text-white font-medium">
                                      {item.question}
                                    </p>
                                  </div>
                                </motion.div>

                                {/* Answer */}
                                <motion.div
                                  className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-green-500 ml-8"
                                  whileHover={{ scale: 1.01 }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="bg-green-500 text-white p-1 rounded-full flex-shrink-0">
                                      <svg
                                        className="w-4 h-4"
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
                                    <div className="text-gray-300">
                                      {Array.isArray(item.answer) ? (
                                        item.answer.map((ans, ansIndex) => (
                                          <p
                                            key={ansIndex}
                                            className="mb-2 last:mb-0"
                                          >
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
            <div className="flex-1 bg-gray-800 rounded-lg shadow-lg p-6">
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
                    Select a chat from the sidebar to view history
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {data[click].chatList.map((item, ind) => (
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
                              <svg
                                className="w-4 h-4"
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
                              <svg
                                className="w-4 h-4"
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
        <div className="w-full md:w-1/4 bg-gray-800 rounded-lg shadow-lg p-6 hidden md:block">
          <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {data.map((item, ind) => (
              <button
                key={item}
                className="border-l-2 border-blue-500 pl-4 cursor-pointer"
                onClick={() => {
                  setClick(ind);
                  console.log("clicked", ind);
                }}
              >
                <div className="space-x-4 cursor-pointer">
                  <div className="flex items-center gap-5">
                    <p className="text-white text-sm w-1xl ">{item.title}</p>
                    <p className="text-gray-400 text-xs">
                      {getTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
