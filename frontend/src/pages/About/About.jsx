import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Database, Zap, RefreshCw, Shield, Cpu, ChevronRight, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function About() {
    const navigate = useNavigate();
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const techStackRef = useRef(null);
    const processRef = useRef(null);
    const architectureRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        // Initial animations
        const tl = gsap.timeline();

        // Hero section animations
        tl.fromTo(titleRef.current, {
            y: 80,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out'
        })
            .fromTo(subtitleRef.current, {
                y: 40,
                opacity: 0,
            }, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out'
            }, "-=0.5");

        // Tech stack animations
        gsap.utils.toArray('.tech-card').forEach((card, i) => {
            gsap.fromTo(card, {
                y: 100,
                opacity: 0,
            }, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                delay: i * 0.1,
                scrollTrigger: {
                    trigger: techStackRef.current,
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Process animations
        gsap.utils.toArray('.process-step').forEach((step, i) => {
            gsap.fromTo(step, {
                x: -100,
                opacity: 0,
            }, {
                x: 0,
                opacity: 1,
                duration: 0.8,
                delay: i * 0.15,
                scrollTrigger: {
                    trigger: processRef.current,
                    start: 'top 70%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Architecture animation
        gsap.fromTo(architectureRef.current, {
            scale: 0.95,
            opacity: 0,
        }, {
            scale: 1,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
                trigger: architectureRef.current,
                start: 'top 70%',
                toggleActions: 'play none none none'
            }
        });

        // CTA animation
        gsap.fromTo(ctaRef.current, {
            y: 50,
            opacity: 0,
        }, {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
                trigger: ctaRef.current,
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        });

        // Continuous animations
        gsap.fromTo('.pulse-animation', {
            y: 0,
        }, {
            y: -10,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // Hover effects for tech cards
        gsap.utils.toArray('.tech-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.fromTo(card, {
                    y: 0
                }, {
                    y: -10,
                    duration: 0.3,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                    ease: 'power2.out'
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.fromTo(card, {
                    y: 20,
                }, {
                    y: 0,
                    duration: 0.3,
                    boxShadow: 'none',
                    ease: 'power2.out'
                });
            });
        });
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 overflow-hidden">


            <div className="relative overflow-hidden py-32 lg:py-40 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1
                            ref={titleRef}
                            className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 leading-tight"
                        >
                            Real-Time Financial Intelligence
                        </h1>
                        <p
                            ref={subtitleRef}
                            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                        >
                            Harness real-time streaming data and Retrieval-Augmented Generation (RAG) to deliver instant, precise financial insights—powered by cutting-edge AI.
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
            </div>

            {/* Tech Stack Section */}
            <div ref={techStackRef} className="py-24 bg-gray-900 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-20">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            Technology Stack
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Brain,
                                title: 'RAG Technology',
                                description: 'Delivering context-aware answers using advanced retrieval-augmented generation.',
                                color: 'text-purple-400'
                            },
                            {
                                icon: Database,
                                title: 'Real-Time Indexing',
                                description: 'Seamless data ingestion and indexing for continuously updated information.',
                                color: 'text-blue-400'
                            },
                            {
                                icon: Zap,
                                title: 'Pathway Platform',
                                description: 'High-performance stream processing for instant, intelligent data flow.',
                                color: 'text-yellow-400'
                            },
                            {
                                icon: RefreshCw,
                                title: 'Live Updates',
                                description: 'Dynamic synchronization with real-time market shifts and data sources.',
                                color: 'text-green-400'
                            },
                            {
                                icon: Shield,
                                title: 'Enterprise Security',
                                description: 'Comprehensive security infrastructure to protect mission-critical data.',
                                color: 'text-red-400'
                            },
                            {
                                icon: Cpu,
                                title: 'AI Integration',
                                description: 'Deep LLM integration for accurate and context-rich responses.',
                                color: 'text-cyan-400'
                            }
                        ]
                            .map((tech, index) => (
                                <div
                                    key={index}
                                    className="tech-card bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-blue-400  relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 "></div>
                                    <div className="relative z-10">
                                        <tech.icon className={`w-12 h-12 ${tech.color} mb-6 pulse-animation`} />
                                        <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-blue-300 ">
                                            {tech.title}
                                        </h3>
                                        <p className="text-gray-400 group-hover:text-gray-300 ">
                                            {tech.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Process Section */}
            <div ref={processRef} className="py-24 bg-gray-800 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-20">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            How It Works
                        </span>
                    </h2>

                    <div className="space-y-16 relative">
                        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500/20 via-blue-500 to-blue-500/20 md:block hidden"></div>

                        {[
                            {
                                title: 'Data Ingestion',
                                description: 'Aggregates diverse live streams including chats, documents, and support tickets.',
                                iconColor: 'bg-blue-500'
                            },
                            {
                                title: 'Real-Time Processing',
                                description: 'Transforms incoming data into usable vectors with minimal latency.',
                                iconColor: 'bg-purple-500'
                            },
                            {
                                title: 'Intelligent Retrieval',
                                description: 'Fetches the most contextually relevant results for every query.',
                                iconColor: 'bg-emerald-500'
                            },
                            {
                                title: 'AI-Powered Responses',
                                description: 'Generates insightful answers using advanced large language models.',
                                iconColor: 'bg-cyan-500'
                            }
                        ].map((step, index) => (
                            <div
                                key={index}
                                className="process-step flex items-start space-x-6 relative group"
                            >
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full ${step.iconColor} flex items-center justify-center text-white text-xl font-bold transform group-hover:scale-110   relative z-10`}>
                                    {index + 1}
                                </div>
                                <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 flex-1 transform group-hover:-translate-y-2  ">
                                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-300  ">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-400 group-hover:text-gray-300  ">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Architecture Section */}
            <div ref={architectureRef} className="py-24 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-20">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            System Architecture
                        </span>
                    </h2>

                    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl transform hover:scale-[1.01]  ">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Input Layer',
                                    description: 'Ingests multiple data feeds in real time.',
                                    features: ['Market Data', 'News Feeds', 'User Queries'],
                                    color: 'from-blue-500 to-blue-600'
                                },
                                {
                                    title: 'Processing Layer',
                                    description: 'Handles real-time indexing and vector creation.',
                                    features: ['Stream Processing', 'Vector DB', 'Context Analysis'],
                                    color: 'from-purple-500 to-purple-600'
                                },
                                {
                                    title: 'Output Layer',
                                    description: 'Delivers insights and interaction at lightning speed.',
                                    features: ['Interactive Chat', 'Visualizations', 'Alerts'],
                                    color: 'from-emerald-500 to-emerald-600'
                                }
                            ].map((layer, index) => (
                                <div key={index} className="text-center">
                                    <div className={`bg-gradient-to-r ${layer.color} p-1 rounded-full inline-block mb-6`}>
                                        <div className="bg-gray-800 rounded-full p-4">
                                            <h3 className="text-xl font-semibold text-white">{layer.title}</h3>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 mb-4">{layer.description}</p>
                                    <ul className="space-y-2">
                                        {layer.features.map((feature, i) => (
                                            <li key={i} className="text-gray-300 flex items-center justify-center">
                                                <ChevronRight className="w-4 h-4 text-blue-800 mr-2" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div ref={ctaRef} className="py-24 bg-gradient-to-br from-gray-900 to-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            Ready to Experience the Future?
                        </span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
                        Join thousands of financial professionals leveraging our AI-powered platform for real-time insights.
                    </p>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-semibold text-lg text-white hover:from-blue-500 hover:to-blue-600 transform shadow-lg hover:shadow-blue-500/30 flex items-center mx-auto group"
                    >
                        Start Your Journey
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1  " />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default About;