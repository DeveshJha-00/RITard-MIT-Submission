"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, useInView, useAnimation } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.2 })

  const testimonials = [
    {
      quote:
        "The financial analytics platform has revolutionized how we make investment decisions. The real-time data insights have helped us increase returns by 25% in just six months.",
      author: "Sarah Johnson",
      position: "CFO, TechVision Enterprises",
      color: "blue",
    },
    {
      quote:
        "The security features are unmatched. We've processed over $50M in transactions with zero security incidents. The biometric authentication gives us complete peace of mind.",
      author: "Michael Chen",
      position: "CTO, Global Payments Inc.",
      color: "purple",
    },
    {
      quote:
        "The international payment system has transformed our global operations. We've reduced transaction fees by 40% and settlement times from days to seconds.",
      author: "Emma Rodriguez",
      position: "Director of Finance, Oceanic Exports",
      color: "cyan",
    },
    {
      quote:
        "The automated investment tools have been a game-changer for our portfolio management. Setup took minutes, and the AI-driven strategies consistently outperform traditional methods.",
      author: "David Thompson",
      position: "Investment Director, Apex Wealth",
      color: "green",
    },
  ]

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [testimonials.length])

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

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
  }

  return (
    <section id="testimonials" className="py-20 bg-neutral-900 text-white relative overflow-hidden">
      {/* Background patterns and effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-blue-400 font-medium mb-3 tracking-wide">WHAT OUR CLIENTS SAY</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Trusted by Industry Leaders
          </h2>
          <p className="text-neutral-300 text-lg">
            Hear from the businesses that have transformed their financial operations with our platform.
          </p>
        </motion.div>

        {/* Testimonial Slider */}
        <div className="relative" ref={ref}>
          {/* Slider navigation */}
          <div className="absolute top-1/2 -left-4 md:-left-8 transform -translate-y-1/2 z-20">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center border border-neutral-700/50 text-white hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute top-1/2 -right-4 md:-right-8 transform -translate-y-1/2 z-20">
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-neutral-800/80 backdrop-blur-sm flex items-center justify-center border border-neutral-700/50 text-white hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Testimonial slider container */}
          <motion.div className="overflow-hidden" variants={containerVariants} initial="hidden" animate={controls}>
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <motion.div
                    className={`bg-neutral-800/50 backdrop-blur-md p-8 rounded-2xl h-full border border-neutral-700/50 transform transition-all duration-300 hover:translate-y-[-10px] hover:shadow-lg hover:shadow-${testimonial.color}-600/10`}
                    variants={itemVariants}
                  >
                    {/* Quote icon */}
                    <div className="mb-6">
                      <svg
                        className={`w-10 h-10 text-${testimonial.color}-500 opacity-50`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"></path>
                      </svg>
                    </div>

                    {/* Testimonial content */}
                    <p className="text-neutral-300 mb-6 italic">"{testimonial.quote}"</p>

                    {/* Testimonial author */}
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-neutral-700 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-neutral-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          ></path>
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{testimonial.author}</h4>
                        <p className="text-neutral-400 text-sm">{testimonial.position}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="mt-6 flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-neutral-400 text-sm">5.0</span>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Testimonial slider pagination */}
        <div className="flex justify-center mt-10 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full focus:outline-none ${
                index === currentIndex ? "bg-blue-500" : "bg-neutral-700 hover:bg-blue-400"
              }`}
              onClick={() => setCurrentIndex(index)}
            ></button>
          ))}
        </div>

        {/* Featured clients section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-10">
            <h3 className="text-xl md:text-2xl font-bold text-white">Trusted by Leading Companies</h3>
          </div>

          {/* Client logos grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-center p-4 bg-neutral-800/50 backdrop-blur-sm rounded-lg border border-neutral-700/50 grayscale hover:grayscale-0 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="h-10 text-neutral-400 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-auto"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d={
                        [
                          "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z",
                          "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
                          "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
                          "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
                          "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
                          "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z",
                        ][index % 6]
                      }
                    ></path>
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-8 md:p-10 border border-blue-500/20 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:max-w-2xl">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to transform your financial future?
                </h3>
                <p className="text-neutral-300 mb-6">
                  Join thousands of satisfied customers who have already revolutionized their financial operations.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href="#get-started"
                  className="inline-flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 shadow-lg shadow-blue-600/25"
                >
                  Get Started Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

