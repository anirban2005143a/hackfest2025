import React, { use, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BarChart,
  MessageSquare,
  LineChart,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { TypewriterEffect } from "../../components/Typewriter.jsx";
import { useNavigate } from "react-router-dom";
gsap.registerPlugin(ScrollTrigger);
import { useContext } from "react";
import AuthContext from "../../Context/Authcontext.js";
function Home() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRefs = useRef([]);
  const sectionRefs = useRef([]);
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const navigate = useNavigate();

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
      className:
        " text-4xl md:text-6xl lg:text-7xl text-blue-500 dark:text-blue-500  mb-8", // Responsive text sizing
    },
  ];

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

  return (
    <>
      <div className=" bg-gray-950 text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={heroRef} className="text-center relative">
              <div className="mt-30 lg:mt-10">
                <h1
                  ref={titleRef}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 mb-8"
                >
                  <TypewriterEffect words={words} />
                  <span className="text-3xl md:text-5xl lg:text-6xl text-gray-100">
                    Powered by AI
                  </span>
                </h1>

                <p
                  ref={subtitleRef}
                  className="my-6 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                >
                  Get insights from your company's Product, Market, Finance, and
                  Competitor documents. Our AI chatbot connects directly with
                  Google Drive to answer questions instantly.
                </p>

                <div className="flex md:flex-row flex-col items-center justify-center gap-6">
                  <button
                    onClick={() => navigate("/chat/ai")}
                    ref={(el) => (buttonRefs.current[0] = el)}
                    className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:brightness-110"
                  >
                    Try It Now ➔
                  </button>
                  <button
                    ref={(el) => (buttonRefs.current[1] = el)}
                    className="cursor-pointer bg-gray-900 text-indigo-300 px-10 py-4 rounded-xl font-bold text-lg border-2 border-indigo-500 hover:bg-gray-800"
                  >
                    See It In Action ▶
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div
          ref={(el) => (sectionRefs.current[0] = el)}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-6">
              AI That Understands Your Documents
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Connect your Drive. Ask anything. Get instant, intelligent
              responses based on real company data.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Drive-Powered AI Chatbot",
                description:
                  "Ask anything about your documents – from revenue forecasts to product insights.",
              },
              {
                icon: BarChart,
                title: "Finance & Market Insights",
                description:
                  "Analyze financial reports, balance sheets, and market trends directly via chat.",
              },
              {
                icon: LineChart,
                title: "Competitor Intelligence",
                description:
                  "Upload competitor data and let AI extract strengths, weaknesses, and patterns.",
              },
              {
                icon: DollarSign,
                title: "Business Q&A Engine",
                description:
                  "Answer complex questions across folders — Product, Market, Finance & more.",
              },
              {
                icon: TrendingUp,
                title: "Smart PDF Parsing",
                description:
                  "Our system intelligently reads PDFs, tables, and charts for contextual answers.",
              },
              {
                icon: MessageSquare,
                title: "Real-Time Updates",
                description:
                  "Add new files to Drive and our AI immediately learns from them — no re-training needed.",
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
                  Built for Business Use Cases
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Whether you’re in finance, strategy, or market research — our
                  platform gives you the answers you need.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 md:p-10 p-5 rounded-2xl text-white transform hover:scale-105 transition-transform duration-300 shadow-xl">
                  <h3 className="text-3xl font-bold mb-6">
                    Investor & Board Reports 📊
                  </h3>
                  <p className="mb-6 text-lg opacity-90">
                    Summarize quarterly reports and forecasts automatically.
                    Provide quick answers during board meetings.
                  </p>
                  <ul className="space-y-4 text-lg">
                    <li className="flex items-center">
                      <span className="mr-3">✓</span>Balance sheet insights
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3">✓</span>Revenue growth analysis
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3">✓</span>Quarterly trends &
                      forecasts
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-teal-500 md:p-10 p-5 rounded-2xl text-white transform hover:scale-105 transition-transform duration-300 shadow-xl">
                  <h3 className="text-3xl font-bold mb-6">
                    Product & Market Teams 📂
                  </h3>
                  <p className="mb-6 text-lg opacity-90">
                    Compare competitor offerings, explore market gaps, and dive
                    into product documentation using natural language.
                  </p>
                  <ul className="space-y-4 text-lg">
                    <li className="flex items-center">
                      <span className="mr-3">✓</span>Competitor comparison
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3">✓</span>Product spec analysis
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3">✓</span>Instant document search
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
