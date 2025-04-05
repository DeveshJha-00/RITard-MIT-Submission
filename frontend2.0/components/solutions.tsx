"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView, useAnimation } from "framer-motion"
import { BarChart2, Lock, CreditCard, Check, Clock, Shield, Zap } from "lucide-react"

export default function Solutions() {
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

  const solutions = [
    {
      icon: <BarChart2 className="h-6 w-6 text-blue-400" />,
      title: "Advanced Analytics",
      description: "AI-powered insights to optimize your investment strategy and track performance in real-time.",
      badge1: "99.8% Accuracy",
      badge2: "Updated hourly",
      color: "blue",
    },
    {
      icon: <Lock className="h-6 w-6 text-purple-400" />,
      title: "Enhanced Security",
      description: "Multi-layer protection with biometric authentication and real-time fraud monitoring.",
      badge1: "256-bit Encryption",
      badge2: "Zero breaches",
      color: "purple",
    },
    {
      icon: <CreditCard className="h-6 w-6 text-cyan-400" />,
      title: "Smart Payments",
      description: "Frictionless cross-border payments with automatic currency conversion at market-leading rates.",
      badge1: "120+ Currencies",
      badge2: "Instant settlement",
      color: "cyan",
    },
  ]

  return (
    <section id="solutions" className="py-20 bg-neutral-900 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10 z-0"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-blue-400 font-medium mb-3 tracking-wide">TAILORED FINANCIAL SOLUTIONS</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Solutions Built for Your Success
          </h2>
          <p className="text-neutral-300 text-lg">
            Advanced financial tools designed to help you navigate today's complex market landscape with confidence.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column: Solutions List */}
          <motion.div ref={ref} className="space-y-8" variants={containerVariants} initial="hidden" animate={controls}>
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                className={`bg-neutral-800/60 backdrop-blur-md p-6 md:p-8 rounded-xl border border-neutral-700/50 transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg hover:shadow-${solution.color}-600/10 group`}
                variants={itemVariants}
              >
                <div className="flex items-start">
                  <div
                    className={`w-12 h-12 bg-${solution.color}-500/20 rounded-lg flex items-center justify-center mr-5 group-hover:bg-${solution.color}-500/30 transition-colors duration-300`}
                  >
                    {solution.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">{solution.title}</h3>
                    <p className="text-neutral-300 mb-3">{solution.description}</p>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 bg-${solution.color}-500/20 text-${solution.color}-400 rounded-full text-sm`}
                      >
                        {solution.badge1}
                      </span>
                      <span className="text-neutral-400 text-sm">{solution.badge2}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column: Image and CTA */}
          <motion.div
            className="relative mt-10 lg:mt-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative rounded-2xl overflow-hidden backdrop-blur-sm bg-neutral-800/30 border border-neutral-700/50 shadow-xl shadow-blue-900/10">
              {/* Main Image */}
              <div className="aspect-w-16 aspect-h-12">
                <Image
                  src="https://cdn.prod.website-files.com/6584d3c7e9c648618ca2ec43/66546ab670e8bcf75b612c83_ct1fpMsdBJWZ5ZaOiFACYHjHysqPi9XRvXzCnrXtfk640ZgIBqONqAmk4BiHnF7l0D5_IWOASMGz8fzZPCTfWoOWo0z4HvNqYfzplhoM-CiOBh8BluLFLYPlD3Xw1-XJUlHnT6bUF-Y6ETwJHtYR8pY.jpeg"
                  alt="Financial professionals discussing solutions in a meeting"
                  width={1080}
                  height={720}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Info overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 bg-gradient-to-t from-neutral-900 to-transparent">
                <div className="flex flex-col">
                  <h4 className="text-xl font-bold text-white mb-2">Enterprise Solutions</h4>
                  <p className="text-neutral-300 mb-4">
                    Tailored financial infrastructure for businesses of all sizes with dedicated support.
                  </p>
                  <Link
                    href="#contact"
                    className="inline-flex items-center font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300 group"
                  >
                    Schedule a consultation
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Floating stat badges */}
              <div className="absolute top-6 right-6 bg-neutral-800/80 backdrop-blur-md rounded-full py-2 px-4 border border-neutral-700/50">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Live Support 24/7</span>
                </div>
              </div>
            </div>

            {/* Floating elements around image */}
            <motion.div
              className="absolute -top-4 -left-4 p-4 bg-blue-500/10 backdrop-blur-md rounded-xl border border-blue-500/20 transform -rotate-3 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <Check className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">95% Client Satisfaction</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -right-4 md:right-4 p-4 bg-purple-500/10 backdrop-blur-md rounded-xl border border-purple-500/20 transform rotate-3 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Fast Implementation</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Action section */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl p-8 md:p-10 border border-blue-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Ready to transform your financial operations?
                </h3>
                <p className="text-neutral-300 mb-6">
                  Join thousands of businesses already leveraging our solutions for growth and efficiency.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="#contact"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="#demo"
                    className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors duration-300 border border-neutral-700 hover:border-neutral-600"
                  >
                    Book Demo
                  </Link>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="flex -space-x-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-cyan-400" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
                    <span className="text-white font-bold">24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

