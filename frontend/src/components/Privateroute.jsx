import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./loader/Loader";

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const verifyAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/auth/login")
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

      if (response.status === 200) {
        setIsAuthenticated(true);
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      localStorage.clear() // Clear invalid token
      // alert("Some error occure .Please login again "); // optional
      navigate("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  if (loading) {
    return (
      <Loader/>
    );
  }

  return isAuthenticated ? children : null;
}

export default PrivateRoute;