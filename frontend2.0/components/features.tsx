"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView, useAnimation } from "framer-motion"
import { Lock, BarChart2, DollarSign, Zap, Users, RefreshCw, ArrowRight } from "lucide-react"

export default function Features() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.1 })

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
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  const featureIcons = [
    { icon: <Lock className="h-6 w-6 text-blue-400" />, color: "blue" },
    { icon: <BarChart2 className="h-6 w-6 text-purple-400" />, color: "purple" },
    { icon: <DollarSign className="h-6 w-6 text-cyan-400" />, color: "cyan" },
    { icon: <Zap className="h-6 w-6 text-indigo-400" />, color: "indigo" },
    { icon: <Users className="h-6 w-6 text-pink-400" />, color: "pink" },
    { icon: <RefreshCw className="h-6 w-6 text-green-400" />, color: "green" },
  ]

  const features = [
    {
      title: "Bank-Level Security",
      description: "End-to-end encryption and advanced fraud protection keep your finances secure.",
      color: "blue",
    },
    {
      title: "Real-Time Analytics",
      description: "Visualize your finances with intuitive dashboards and predictive insights.",
      color: "purple",
    },
    {
      title: "Smart Budgeting",
      description: "AI-powered budgeting tools that adapt to your spending habits and goals.",
      color: "cyan",
    },
    {
      title: "Instant Transfers",
      description: "Send and receive money globally with zero fees and lightning-fast processing.",
      color: "indigo",
    },
    {
      title: "Team Collaboration",
      description: "Share finances with team members with custom access levels and controls.",
      color: "pink",
    },
    {
      title: "Automated Investing",
      description: "Set-and-forget investment strategies with auto-rebalancing portfolios.",
      color: "green",
    },
  ]

  return (
    <section id="features" className="py-16 md:py-24 bg-neutral-900 text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 inline-block">
            Powerful Features
          </h2>
          <p className="text-neutral-300 max-w-2xl mx-auto text-lg">
            Our cutting-edge platform offers modern solutions for modern financial challenges
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`group bg-neutral-800/50 backdrop-blur-lg rounded-xl p-6 transition-all duration-300 hover:translate-y-[-8px] hover:shadow-lg hover:shadow-${feature.color}-500/10 border border-neutral-700/50`}
              variants={itemVariants}
            >
              <div
                className={`w-12 h-12 bg-${feature.color}-500/20 rounded-lg flex items-center justify-center mb-5 group-hover:bg-${feature.color}-500/30 transition-all duration-300`}
              >
                {featureIcons[index].icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-neutral-400 mb-4">{feature.description}</p>
              <Link
                href="#"
                className={`text-${feature.color}-400 hover:text-${feature.color}-300 flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform duration-300`}
              >
                Learn more
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Showcase Image */}
        <motion.div
          className="mt-20 relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-neutral-800/30 backdrop-blur-sm rounded-2xl p-2 max-w-5xl mx-auto overflow-hidden border border-neutral-700/50">
            <Image
              src="https://media.licdn.com/dms/image/v2/D5612AQHWZlD5aa5kMw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1729785974312?e=2147483647&v=beta&t=vYCTLpGAKLAWRJwAj1LqYHSsUFzQQVDYeI_Hw6cs6tg"
              alt="Interactive fintech platform interface showcase"
              className="w-full h-auto rounded-xl transform hover:scale-[1.01] transition-transform duration-500 shadow-lg"
              width={1080}
              height={720}
            />
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
              <span className="px-4 py-2 bg-blue-500/90 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                Powerful Dashboard
              </span>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            href="#"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 group"
          >
            Explore All Features
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

