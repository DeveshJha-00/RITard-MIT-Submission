"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView, useAnimation } from "framer-motion"

export default function Cta() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.2 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

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
    <section id="cta" className="relative py-20 overflow-hidden bg-neutral-900">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5 z-0"></div>

      {/* Floating circles */}
      <motion.div
        className="absolute top-1/4 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      ></motion.div>
      <motion.div
        className="absolute bottom-1/4 right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: 1,
        }}
      ></motion.div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* CTA Card with glassmorphism effect */}
          <motion.div
            ref={ref}
            className="bg-neutral-800/40 backdrop-blur-md rounded-3xl border border-neutral-700/50 overflow-hidden shadow-2xl relative"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {/* Grid layout for CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left column with image */}
              <motion.div className="relative h-64 lg:h-auto overflow-hidden" variants={itemVariants}>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent z-10 lg:hidden"></div>
                <Image
                  src="https://1finance.co.in/magazine/wp-content/uploads/2024/04/financial-planning-text-yellow-notepad-with-financial-data-analysis-background-financial-planning-concept-1-scaled.jpg"
                  alt="Professional businessman in a confident pose"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                {/* Image credit */}
                <div className="absolute bottom-4 left-4 bg-neutral-900/70 backdrop-blur-sm py-1 px-3 rounded-full z-20">
                  <p className="text-neutral-400 text-xs">Photo by FinEdge</p>
                </div>
              </motion.div>

              {/* Right column with content */}
              <motion.div className="p-8 md:p-12 flex flex-col justify-center" variants={itemVariants}>
                <div className="max-w-lg">
                  <span className="inline-block px-4 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                    LIMITED TIME OFFER
                  </span>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
                    Transform Your Financial Future Today
                  </h2>

                  <p className="text-neutral-300 text-lg mb-8">
                    Join thousands of users who have already revolutionized their financial operations with our
                    cutting-edge platform.
                  </p>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">2.5M+</div>
                      <div className="text-neutral-400 text-sm">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">$150B+</div>
                      <div className="text-neutral-400 text-sm">Processed</div>
                    </div>
                    <div className="text-center hidden md:block">
                      <div className="text-2xl md:text-3xl font-bold text-white mb-1">99.9%</div>
                      <div className="text-neutral-400 text-sm">Uptime</div>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="#get-started"
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:scale-105 transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    >
                      Get Started Now
                    </Link>
                    <Link
                      href="#book-demo"
                      className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl border border-neutral-700 hover:border-blue-400 transform hover:scale-105 transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    >
                      Book a Demo
                    </Link>
                  </div>

                  {/* Trust badges */}
                  <div className="mt-8 pt-8 border-t border-neutral-700/50">
                    <div className="flex flex-wrap items-center gap-6">
                      <span className="text-neutral-400 text-sm">Trusted by:</span>
                      <div className="flex items-center gap-6">
                        {/* Trust badge icons */}
                        {[1, 2, 3].map((index) => (
                          <svg
                            key={index}
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-neutral-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path
                              d={
                                [
                                  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z",
                                  "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
                                  "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z",
                                ][index % 3]
                              }
                            ></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Newsletter signup floating input */}
          <motion.div
            className="mt-16 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-white text-xl md:text-2xl font-bold mb-3">Stay Updated</h3>
              <p className="text-neutral-400">Subscribe to our newsletter for the latest features and updates.</p>
            </div>

            <div className="bg-neutral-800/40 backdrop-blur-md rounded-xl p-2 border border-neutral-700/50 shadow-lg transform hover:translate-y-[-5px] transition-all duration-300">
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-5 py-3 bg-neutral-800/80 rounded-lg border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="text-center mt-4">
              <p className="text-neutral-500 text-sm">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

