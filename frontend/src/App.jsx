import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home.jsx";
import Navbar from "./components/Navbar.jsx";
import Signup from "./pages/auth/signup.jsx";
import Login from "./pages/auth/Login.jsx";
import Chat from "./pages/chat/Chat.jsx";
import DashboardPage from "./pages/Dashboard/Dashboardpage.jsx";
import PrivateRoute from "./components/Privateroute.jsx";
import AuthContext from "./Context/Authcontext.js";
import axios from "axios";
import { useEffect, useState } from "react";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const verifyAuth = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        "http://localhost:3000/api/user/profile",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setIsAuthenticated(true);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.log("Not authenticated", error);
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
        }}
      >
        <BrowserRouter>
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
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </>
  );
}

export default App;
