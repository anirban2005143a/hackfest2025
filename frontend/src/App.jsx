import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home.jsx";
import Navbar from "./components/Navbar.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Login from "./pages/auth/Login.jsx";
import Chat from "./pages/chat/Chat.jsx";
import DashboardPage from "./pages/Dashboard/Dashboardpage.jsx";
import PrivateRoute from "./components/Privateroute.jsx";
import AuthContext from "./Context/Authcontext.js";
import axios from "axios";
import { useEffect, useState } from "react";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Feedback from "./pages/Feedback/Feedback.jsx";
import About from "./pages/About/About.jsx";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const verifyAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/user/profile`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("Response from verifyAuth", response);

      if (response.status === 200) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // seterrorMessage(response.data.message || "Authentication failed");
        // throw new Error("Authentication failed");
      }
    } catch (error) {
      console.log(error);
      setIsAuthenticated(false);
      // if (error.response && error.response.data) seterrorMessage(error.response.data.message )
      // else seterrorMessage(error.message)
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  
  return (
    <>
      <AuthContext.Provider
        value={{
          isAuthenticated,
          setIsAuthenticated,
          verifyAuth
        }}
      >
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar /> <Home />
                </>
              }
            />
            <Route
              path="/about"
              element={
                <>
                  <Navbar /> <About />
                </>
              }
            />
            <Route
              path="/auth/login"
              element={
                <>
                  <Navbar />
                  <Login />{" "}
                </>
              }
            />
            <Route
              path="/auth/signup"
              element={
                <>
                  <Navbar /> <Signup />
                </>
              }
            />
            <Route
              path="/chat/:chatId"
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <PrivateRoute>
                  <Navbar />
                  <Feedback />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </>
  );
}

export default App;
