"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  return (
    <div className="space-y-24 py-12">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-mint/5 -z-10"></div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            delay: 0.2 
          }}
          className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1.5, 
            ease: "easeOut",
            delay: 0.4 
          }}
          className="absolute bottom-10 left-10 w-72 h-72 bg-mint/10 rounded-full blur-3xl -z-10"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.15, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute top-40 left-[15%] w-8 h-8 bg-accent rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-20 right-[20%] w-6 h-6 bg-primary rounded-md rotate-45"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute top-[60%] left-[30%] w-12 h-12 bg-mint rounded-lg floating"
        />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8,
                staggerChildren: 0.2
              }}
              className="space-y-8"
            >
              <div className="space-y-3 hero-decoration">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl md:text-6xl font-bold tracking-tight text-charcoal"
                >
                  Emergency care, <span className="text-glow-slide">redefined</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl text-charcoal-light leading-relaxed max-w-lg"
                >
                  AI-powered response systems connecting patients with emergency services when every moment counts.
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                {session ? (
                  <Link 
                    href={session.user.role === "MEDICAL_DIRECTOR" ? "/director" : "/paramedic"}
                    className="px-6 py-3.5 bg-primary text-white font-medium rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/login"
                    className="px-6 py-3.5 bg-primary text-white font-medium rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                  >
                    Join AidMate
                  </Link>
                )}
                
                <Link 
                  href="/AI-Assistant" 
                  className="px-6 py-3.5 bg-white text-primary font-medium rounded-xl border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                >
                  Try AI Assistant
                </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center gap-4 pt-4"
              >
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.5, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + (i * 0.1) }}
                      className="w-10 h-10 rounded-full bg-surface border-2 border-white flex items-center justify-center text-xs text-charcoal-light"
                    >
                      {String.fromCharCode(65 + i)}
                    </motion.div>
                  ))}
                </div>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="text-sm text-charcoal-light"
                >
                  <span className="font-semibold">2,000+</span> emergency professionals trust AidMate
                </motion.p>
              </motion.div>
            </motion.div>
            
            {/* Enhanced UI mockup with animated elements */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <motion.div 
                className="relative h-[500px] w-full max-w-[500px] mx-auto"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ 
                  duration: 1.2,
                  ease: "easeOut" 
                }}
              >
                <motion.div 
                  initial={{ rotate: 3, scale: 0.95 }}
                  animate={{ rotate: 3, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 to-mint/20 rounded-3xl"
                />
                
                <motion.div 
                  initial={{ rotate: -3, scale: 0.95 }}
                  animate={{ rotate: -3, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.8,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="absolute inset-0 bg-white rounded-3xl shadow-xl overflow-hidden"
                >
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="absolute top-0 left-0 right-0 h-12 bg-primary/10 flex items-center px-4"
                  >
                    <div className="flex space-x-2">
                      {[
                        "bg-accent/40",
                        "bg-yellow-400/40",
                        "bg-mint/40"
                      ].map((bg, i) => (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 200,
                            delay: 1.4 + (i * 0.1)
                          }}
                          className={`w-3 h-3 ${bg} rounded-full`}
                        />
                      ))}
                    </div>
                  </motion.div>
                  
                  <div className="pt-16 px-6 pb-6">
                    <div className="space-y-4">
                      <motion.div 
                        initial={{ width: "50%" }}
                        animate={{ width: "100%" }}
                        transition={{ 
                          duration: 1.5, 
                          delay: 1.6,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "reverse",
                          repeatDelay: 2
                        }}
                        className="h-12 bg-primary/10 rounded-lg"
                      />
                      
                      <div className="space-y-2">
                        {[
                          "w-3/4",
                          "w-full",
                          "w-5/6"
                        ].map((width, i) => (
                          <motion.div 
                            key={i}
                            initial={{ width: "20%", opacity: 0.3 }}
                            animate={{ width: width, opacity: 1 }}
                            transition={{ 
                              duration: 0.8, 
                              delay: 1.8 + (i * 0.2)
                            }}
                            className={`h-4 bg-gray-200 rounded-full`}
                          />
                        ))}
                      </div>
                      
                      <div className="pt-4">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: "8rem" }}  
                          transition={{ 
                            duration: 0.8, 
                            delay: 2.4
                          }}
                          className="h-32 bg-surface rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.8, duration: 0.5 }}
                            className="p-3"
                          >
                            <div className="flex mb-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 mr-2"></div>
                              <div className="h-2 bg-gray-300 rounded w-20 my-auto"></div>
                            </div>
                            <div className="space-y-1">
                              <div className="h-1.5 bg-gray-200 rounded w-full"></div>
                              <div className="h-1.5 bg-gray-200 rounded w-5/6"></div>
                              <div className="h-1.5 bg-gray-200 rounded w-4/6"></div>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                      
                      <div className="flex justify-end">
                        <motion.div 
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 3 }}
                          className="h-10 w-24 bg-primary/20 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 50 }}
                animate={{ opacity: 0.8, scale: 1, x: 0 }}
                transition={{ delay: 2, duration: 0.8 }}
                className="absolute top-[-20px] right-[-10px] w-16 h-16"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full text-primary/30 floating">
                  <path fill="currentColor" d="M10.75 8a2.75 2.75 0 11-5.5 0 2.75 2.75 0 015.5 0zM6 11.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zm8 3.5a2 2 0 11-4 0 2 2 0 014 0zm-2.75 0a.75.75 0 100-1.5.75.75 0 000 1.5zM19 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-1.5 2.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">AI-Powered Emergency Response</h2>
          <p className="text-lg text-charcoal-light">
            Our platform seamlessly connects patients, paramedics, and medical directors through intelligent systems.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
              title: "AI First Aid Guidance",
              description: "Real-time AI assistance for emergency procedures and guidance when medical professionals aren't immediately available."
            },
            {
              icon: "M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75",
              title: "Case Management",
              description: "Streamlined workflows for creating, assigning, and managing emergency response cases from start to finish."
            },
            {
              icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5",
              title: "Medical Records",
              description: "Comprehensive medical reporting system for paramedics to document treatments and transfer information to hospitals."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.7, 
                delay: i * 0.2,
                type: "spring",
                stiffness: 50
              }}
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 123, 255, 0.1), 0 10px 10px -5px rgba(0, 123, 255, 0.04)"
              }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300"
            >
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200,
                  delay: 0.3 + (i * 0.1)
                }}
                viewport={{ once: true }}
                className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold text-charcoal mb-3">{feature.title}</h3>
              <p className="text-charcoal-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* CTA Section - Enhanced */}
      <section className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl overflow-hidden shadow-xl relative"
        >
          {/* Add animated background shapes */}
          <motion.div 
            animate={{ 
              x: [0, 15, 0],
              y: [0, -10, 0],
              opacity: [0.15, 0.2, 0.15]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "mirror"
            }}
            className="absolute top-20 right-20 w-40 h-40 rounded-full bg-white/10"
          />
          <motion.div 
            animate={{ 
              x: [0, -20, 0],
              y: [0, 15, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              repeatType: "mirror" 
            }}
            className="absolute bottom-10 left-40 w-60 h-60 rounded-full bg-white/5"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white mb-6"
              >
                Ready to transform emergency response?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-white/90 text-lg mb-8 max-w-lg"
              >
                Join thousands of medical professionals using AidMate to save lives and improve emergency care outcomes.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link 
                  href="/login" 
                  className="px-8 py-4 bg-white text-primary font-medium rounded-xl text-center hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Get Started
                </Link>
                
              </motion.div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary to-transparent"></div>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.8,
                  delay: 0.3,
                  type: "spring",
                  stiffness: 50
                }}
                viewport={{ once: true }}
                className="h-full w-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-40 h-40 text-white/30">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}