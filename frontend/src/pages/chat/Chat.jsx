import React, { useContext, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import AuthContext from '../../Context/Authcontext';
import Loader from '../../components/loader/Loader';
import { ToastContainer , toast } from 'react-toastify';

function Chat() {

  const { isAuthenticated, setIsAuthenticated, verifyAuth } = useContext(AuthContext);

  // useEffect(() => {
  //   if (isAuthenticated === null) {
  //     verifyAuth()
  //   }
  // }, [isAuthenticated])

    useEffect(() => {
      if(isAuthenticated === false) navigate("/auth/login")
    }, [isAuthenticated])

  return (
    <>
      {!isAuthenticated && <Loader/>}
      {isAuthenticated && <div className="app dark-theme h-screen bg-gray-950">
        <ChatInterface />
      </div>}
    </>
  );
}

export default Chat;