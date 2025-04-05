import React, { useContext, useState } from 'react';
import { User, Lock, Mail, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/Authcontext';


function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: ''
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repeatPassword: ''
  });
  const [isLoading, setisLoading] = useState(false)
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      repeatPassword: ''
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form and get isValid status
    const isValid = validateForm();

    if (!isValid) {
      // Collect all error messages
      const errorMessages = Object.values(errors).filter(msg => msg !== '');

      // Show all errors in a single alert
      if (errorMessages.length > 0) {
        alert(`Please fix these errors:\n\n• ${errorMessages.join('\n• ')}`);
      }
      return;
    }

    // Only proceed if validation passes
    try {
      setisLoading(true)
      console.log("Form is valid, submitting...");
      const response = await axios.post("http://localhost:3000/api/user/register", {
        fullname: {
          firstname: formData.firstName,
          lastname: formData.lastName
        },
        email: formData.email,
        password: formData.password,
      });

      console.log(response);
      alert(response?.data?.message);

      if (response?.data?.token) {
        setIsAuthenticated(true);
        localStorage.setItem("token", response?.data?.token);
        localStorage.setItem("userid", response?.data?.userid);
        navigate("/");
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Something went wrong!");
      console.error('Error submitting form:', error);
    } finally {
      setisLoading(false)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user types
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      backgroundColor: "#6366f1" // indigo-600
    },
    tap: {
      scale: 0.98,
      backgroundColor: "#4f46e5" // indigo-700
    }
  };

  const inputFocusVariants = {
    focus: {
      borderColor: "#818cf8", // indigo-400
      boxShadow: "0 0 0 2px rgba(129, 140, 248, 0.5)"
    }
  };

  return (
    <motion.div
      id='signup'
      className="py-25 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-700"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10
        }}
      >
        <motion.div
          className="text-center mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-3xl font-bold text-white mb-2"
            variants={itemVariants}
          >
            Create Account
          </motion.h1>
          <motion.p
            className="text-gray-400"
            variants={itemVariants}
          >
            Join us today and start your journey
          </motion.p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="firstName">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <motion.input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 bg-gray-700 ${errors.firstName ? 'border-red-500' : 'border-gray-600'
                    } border rounded-lg focus:outline-none text-white placeholder-gray-400`}
                  placeholder="John"
                  whileFocus={inputFocusVariants.focus}
                />
                {errors.firstName && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.firstName && (
                <motion.p
                  className="mt-1 text-sm text-red-400"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.firstName}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="lastName">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <motion.input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 bg-gray-700 ${errors.lastName ? 'border-red-500' : 'border-gray-600'
                    } border rounded-lg focus:outline-none text-white placeholder-gray-400`}
                  placeholder="Doe"
                  whileFocus={inputFocusVariants.focus}
                />
                {errors.lastName && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.lastName && (
                <motion.p
                  className="mt-1 text-sm text-red-400"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.lastName}
                </motion.p>
              )}
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
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
                className={`block w-full pl-10 pr-3 py-2 bg-gray-700 ${errors.email ? 'border-red-500' : 'border-gray-600'
                  } border rounded-lg focus:outline-none text-white placeholder-gray-400`}
                placeholder="john.doe@example.com"
                whileFocus={inputFocusVariants.focus}
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
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {errors.email}
              </motion.p>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
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
                className={`block w-full pl-10 pr-3 py-2 bg-gray-700 ${errors.password ? 'border-red-500' : 'border-gray-600'
                  } border rounded-lg focus:outline-none text-white placeholder-gray-400`}
                placeholder="••••••••"
                whileFocus={inputFocusVariants.focus}
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
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="repeatPassword">
              Repeat Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <motion.input
                type="password"
                id="repeatPassword"
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 bg-gray-700 ${errors.repeatPassword ? 'border-red-500' : 'border-gray-600'
                  } border rounded-lg focus:outline-none text-white placeholder-gray-400`}
                placeholder="••••••••"
                whileFocus={inputFocusVariants.focus}
              />
              {errors.repeatPassword && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.repeatPassword && (
              <motion.p
                className="mt-1 text-sm text-red-400"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {errors.repeatPassword}
              </motion.p>
            )}
          </motion.div>

          <motion.button
            disabled={isLoading}
            type="submit"
            onSubmit={handleSubmit}
            className="w-full cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {!isLoading && <CheckCircle2 className="h-5 w-5" />}
            {isLoading ? <Loader className=' animate-spin' /> : <span>Create Account</span>}
          </motion.button>
        </motion.form>

        <motion.p
          className="mt-6 text-center text-sm text-gray-400"
          variants={itemVariants}
        >
          Already have an account?{' '}
          <Link to='/auth/login' className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default Signup;