import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Navbar from "./components/Navbar";
import Signup from "./pages/auth/signup";
import Login from "./pages/auth/Login";
import Chat from "./pages/chat/Chat";
import DashboardPage from "./pages/Dashboard/Dashboardpage";

function App() {
  return (
    <>
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
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
