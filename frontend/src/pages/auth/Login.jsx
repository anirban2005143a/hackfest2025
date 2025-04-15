import React, { use, useState, useContext } from "react";
import { Mail, Lock, LogIn, AlertCircle, Loader } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../Context/Authcontext";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

function Login() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setisLoading] = useState(false)
  const navigate = useNavigate();

  // const validateForm = () => {
  //   let isValid = true;
  //   const newErrors = {
  //     email: "",
  //     password: "",
  //   };

  //   if (!formData.email.trim()) {
  //     newErrors.email = "Email is required";
  //     isValid = false;
  //   } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
  //     newErrors.email = "Please enter a valid email";
  //     isValid = false;
  //   }

  //   if (!formData.password) {
  //     newErrors.password = "Password is required";
  //     isValid = false;
  //   } else if (formData.password.length < 6) {
  //     newErrors.password = 'Password must be at least 6 characters';
  //     isValid = false;
  //   }

  //   setErrors(newErrors);
  //   return isValid;
  // };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form and get isValid status
    const isValid = validateForm();

    if (!isValid) {
      // Collect all error messages
      const errorMessages = Object.values(errors).filter(msg => msg !== '');

      // Show all errors in a single alert
      if (errorMessages.length > 0) {
        // alert(`Please fix these errors:\n\n• ${errorMessages.join('\n• ')}`);
        showToast(errorMessages.join('\n• '), true)
      }
      return;
    }

    // Proceed with form submission if no errors
    try {
      setisLoading(true)
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/user/login`,
        formData
      );

      if (response?.data?.token) {
        setIsAuthenticated(true);
        localStorage.setItem("token", response?.data?.token);
        localStorage.setItem("userid", response?.data?.userid);
        localStorage.setItem("email", response?.data?.email);
        showToast(response.data.message, false)
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      // alert(error.response.data.message);
      showToast(error.response?.data?.message || error.message, true)
      setIsAuthenticated(false);
    } finally {
      setisLoading(false)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  return (
    <>
      <ToastContainer />
      <motion.div
        id="login"
        className="py-25 min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <motion.div
            className="text-center mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="flex justify-center mb-4"
              variants={itemVariants}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  delay: 0.5,
                  duration: 0.5,
                }}
              >
                <LogIn className="h-12 w-12 text-blue-400" />
              </motion.div>
            </motion.div>
            <motion.h1
              className="text-3xl font-bold text-white mb-2"
              variants={itemVariants}
            >
              Welcome Back
            </motion.h1>
            <motion.p className="text-gray-400" variants={itemVariants}>
              Sign in to your account
            </motion.p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <label
                className="block text-sm font-medium text-gray-300 mb-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <motion.input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 bg-gray-700 border ${errors.email ? "border-red-500" : "border-gray-600"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400`}
                  placeholder="you@example.com"
                  whileFocus={{
                    borderColor: errors.email ? "#EF4444" : "#3B82F6",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                  }}
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <motion.p
                  className="mt-1 text-sm text-red-400"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                className="block text-sm font-medium text-gray-300 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <motion.input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 bg-gray-700 border ${errors.password ? "border-red-500" : "border-gray-600"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400`}
                  placeholder="••••••••"
                  whileFocus={{
                    borderColor: errors.password ? "#EF4444" : "#3B82F6",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                  }}
                />
                {errors.password && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.password && (
                <motion.p
                  className="mt-1 text-sm text-red-400"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              className="flex items-center justify-between"
              variants={itemVariants}
            ></motion.div>

            <motion.button
              disabled={isLoading}
              type="submit"
              onSubmit={handleSubmit}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 flex cursor-pointer items-center justify-center space-x-2"
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {!isLoading && <LogIn className="h-5 w-5" />}
              {isLoading ? <Loader className=" animate-spin" /> : <span>Sign In</span>}
            </motion.button>
          </motion.form>

          <motion.p
            className="mt-6 text-center text-sm text-gray-400"
            variants={itemVariants}
          >
            Don't have an account?{" "}
            <Link to='/auth/signup' className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </>
  );
}

export default Login;


