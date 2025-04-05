import React, { useContext, useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Bug, Lightbulb, Send } from 'lucide-react';
import AuthContext from '../../Context/Authcontext';
import Loader from '../../components/loader/Loader';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify"

function Feedback() {

  const [feedbackType, setFeedbackType] = useState('');
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');

  const { isAuthenticated, setIsAuthenticated, verifyAuth } = useContext(AuthContext);

  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle feedback submission here
    console.log({ feedbackType, feedback, email });
    // Reset form
    setFeedbackType('');
    setFeedback('');
    setEmail('');
  };

  const feedbackTypes = [
    { id: 'general', icon: MessageSquare, label: 'General Feedback' },
    { id: 'positive', icon: ThumbsUp, label: 'Positive Feedback' },
    { id: 'negative', icon: ThumbsDown, label: 'Negative Feedback' },
    { id: 'bug', icon: Bug, label: 'Report Bug' },
    { id: 'suggestion', icon: Lightbulb, label: 'Suggestion' },
  ];

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/auth/login")
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated === null) {
      verifyAuth()
    }
  }, [isAuthenticated])


  return (
    <>
      <ToastContainer />
      {!isAuthenticated && <Loader />}
      {isAuthenticated && <div id='feedback' className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8   ">
        <div className="max-w-2xl mx-auto mt-[60px]">
          <h1 className="text-3xl font-bold text-gray-100 mb-8">Share Your Feedback</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {feedbackTypes.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFeedbackType(id)}
                  className={`
                  p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2
                  ${feedbackType === id
                      ? 'border-purple-500 bg-gray-800'
                      : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600'}
                `}
                >
                  <Icon className={`w-6 h-6 ${feedbackType === id ? 'text-purple-500' : 'text-gray-400'}`} />
                  <span className="text-sm text-center">{label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors duration-200"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors duration-200 resize-none"
                  placeholder="Share your thoughts..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <Send className="w-4 h-4" />
              Submit Feedback
            </button>
          </form>

          <div className="mt-8 text-sm text-gray-400 text-center">
            Thank you for helping us improve our product
          </div>
        </div>
      </div>}
    </>
  );
}

export default Feedback;