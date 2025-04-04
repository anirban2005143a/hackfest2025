import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BarChart,MessageSquare ,LineChart , DollarSign , TrendingUp } from "lucide-react"
// import FeatureCard from "./FeatureCard";
// import Loader from "../../components/loader/Loader";
import { toast, ToastContainer } from "react-toastify";
import { TypewriterEffect } from "../../components/Typewriter.jsx";
gsap.registerPlugin(ScrollTrigger);

function Home() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRefs = useRef([]);
  const sectionRefs = useRef([]);

  // const [isloading, setisloading] = useState(false);
  const words = [
    {
      text: "Financial",
      className: " text-4xl md:text-6xl lg:text-7xl font-bold mb-8", // Responsive text sizing
    },
    {
      text: "-",
      className: " text-4xl md:text-6xl lg:text-7xl font-bold mb-8", // Responsive text sizing
    },
    {
      text: " Intelligence",
      className: " text-4xl md:text-6xl lg:text-7xl font-bold text-blue-500  mb-8", // Responsive text sizing
    },
    
  ];
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
  };

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      {
        y: -50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      }
    );

    gsap.fromTo(
      subtitleRef.current,
      {
        y: 20,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out",
      }
    );

    gsap.fromTo(
      buttonRefs.current,
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        delay: 0.4,
        stagger: 0.15,
        ease: "back.out",
      }
    );

    sectionRefs.current.forEach((section, index) => {
      gsap.fromTo(
        section,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: index * 0.2,
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
          },
        }
      );
    });
  }, []);

  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleChange = (e) => {
    console.log(e.target.value);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    console.log("submitted");
  };

  return (
    <>
      {/* <ToastContainer /> */}
      
        <div className="min-h-screen bg-gray-950 text-white">
          {/* Hero Section */}
          <div className="relative overflow-hidden min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div ref={heroRef} className="text-center relative">
                <div className="mt-30 lg:mt-10">
                  <h1
                    ref={titleRef}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 mb-8"
                  >
                    {/* Financial Intelligence */}
                    <TypewriterEffect words={words}/>
                    <br />
                    <span className="text-3xl md:text-5xl lg:text-6xl text-gray-100">
                      Powered by AI
                    </span>
                  </h1>
                  
                  <p ref={subtitleRef} className="my-6 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Get instant insights about any company's financial data. Make
                    informed decisions with our advanced AI-powered analytics
                    platform.
                  </p>
                  <div className="flex md:flex-row flex-col items-center justify-center gap-6">
                    <button
                      ref={(el) => (buttonRefs.current[0] = el)}
                      className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:brightness-110"
                    >
                      Get Started ➔
                    </button>
                    <button
                      ref={(el) => (buttonRefs.current[1] = el)}
                      className="cursor-pointer bg-gray-900 text-indigo-300 px-10 py-4 rounded-xl font-bold text-lg border-2 border-indigo-500 hover:bg-gray-800"
                    >
                      Watch Demo ▶
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Features Section */}
          <div
            ref={(el) => (sectionRefs.current[0] = el)}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 "
          >
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-white mb-6">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Our platform combines cutting-edge technologies to deliver a
                seamless question-answering experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart,
                  title: "Advanced Analytics",
                  description:
                    "Deep dive into financial metrics with our advanced analytical tools",
                },
                {
                  icon: MessageSquare,
                  title: "AI Assistant",
                  description:
                    "Get instant answers to your financial questions through our AI chat interface",
                },
                {
                  icon: LineChart,
                  title: "Market Insights",
                  description:
                    "Real-time market data and trends to keep you ahead of the curve",
                },
                {
                  icon: DollarSign,
                  title: "Financial Forecasting",
                  description:
                    "Predictive analytics to help you make better financial decisions",
                },
                {
                  icon: TrendingUp,
                  title: "Performance Tracking",
                  description:
                    "Monitor and analyze company performance metrics in real-time",
                },
                {
                  icon: MessageSquare,
                  title: "Smart Alerts",
                  description:
                    "Get notified about important financial events and market changes",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl p-8 hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-gray-700"
                >
                  <feature.icon className="w-12 h-12 text-blue-400 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-100 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
  
            {/* Use Case Section */}
            <div
              ref={(el) => (sectionRefs.current[1] = el)}
              className="bg-gray-900 py-10 mt-20 rounded-2xl"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                  <h2 className="text-4xl font-bold text-white mb-6">
                    Real-World Applications
                  </h2>
                  <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    From government policy updates to real-time flight
                    information, our system adapts to your needs.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 md:p-10 p-5 rounded-2xl text-white transform hover:scale-105 transition-transform duration-300 shadow-xl">
                    <h3 className="text-3xl font-bold mb-6">
                      Government Policy Updates 📜
                    </h3>
                    <p className="mb-6 text-lg opacity-90">
                      Stay informed about the latest policy changes and
                      regulations in real-time.
                    </p>
                    <ul className="space-y-4 text-lg">
                      <li className="flex items-center">
                        <span className="mr-3">✓</span>Immediate policy change
                        notifications
                      </li>
                      <li className="flex items-center">
                        <span className="mr-3">✓</span>Contextual understanding of
                        regulations
                      </li>
                      <li className="flex items-center">
                        <span className="mr-3">✓</span>Historical policy tracking
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-teal-500 md:p-10 p-5 rounded-2xl text-white transform hover:scale-105 transition-transform duration-300 shadow-xl">
                    <h3 className="text-3xl font-bold mb-6">
                      Flight Status Updates ✈️
                    </h3>
                    <p className="mb-6 text-lg opacity-90">
                      Access real-time flight information and delay updates
                      instantly.
                    </p>
                    <ul className="space-y-4 text-lg">
                      <li className="flex items-center">
                        <span className="mr-3">✓</span>Live delay notifications
                      </li>
                      <li className="flex items-center">
                        <span className="mr-3">✓</span>Alternative route
                        suggestions
                      </li>
                      <li className="flex items-center">
                        <span className="mr-3">✓</span>Weather impact analysis
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
   
    </>
  )}

  export default Home;

