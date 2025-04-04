import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function FeatureCard({ icon, title, description, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: index * 0.1,
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
        },
      }
    );
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="bg-zinc-900 sm:p-8 p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 transform rotate-3 hover:rotate-6 transition-transform">
        <span className="text-3xl text-white">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-zinc-300 leading-relaxed">{description}</p>
    </div>
  );
}

export default FeatureCard;
