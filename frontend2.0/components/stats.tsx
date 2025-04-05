"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { motion, useInView, useAnimation } from "framer-motion"
import { Users, ClipboardCheck, DollarSign, Globe } from "lucide-react"

export default function Stats() {
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

  const stats = [
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      value: "2.5M+",
      label: "Active Users",
      color: "blue",
    },
    {
      icon: <ClipboardCheck className="w-6 h-6 text-purple-400" />,
      value: "99.9%",
      label: "Uptime Reliability",
      color: "purple",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-cyan-400" />,
      value: "$150B+",
      label: "Transactions Processed",
      color: "cyan",
    },
    {
      icon: <Globe className="w-6 h-6 text-green-400" />,
      value: "120+",
      label: "Countries Served",
      color: "green",
    },
  ]

  return (
    <section id="stats" className="relative py-20 bg-neutral-900 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Our Growth in Numbers
            </span>
          </h2>
          <p className="text-lg text-neutral-300">
            Empowering businesses and individuals with next-generation financial technology
          </p>
        </motion.div>

        {/* Stats container with background image */}
        <motion.div
          className="relative rounded-2xl overflow-hidden backdrop-blur-sm bg-neutral-800/40 border border-neutral-700/50"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/placeholder.svg?height=720&width=1080"
              alt="Professional business environment"
              width={1080}
              height={720}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Stats grid overlay */}
          <motion.div
            ref={ref}
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8 md:p-10"
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={`stat-card backdrop-blur-md bg-neutral-800/70 rounded-xl p-6 border border-neutral-700 transform hover:scale-105 transition-transform duration-300`}
                variants={itemVariants}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full bg-${stat.color}-500/20 mb-5`}
                  >
                    {stat.icon}
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2 counter">{stat.value}</h3>
                  <p className="text-neutral-300 text-lg">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Additional stats details */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Customer Growth", value: "+32%", color: "green", width: "80%" },
            { title: "Transaction Volume", value: "+65%", color: "blue", width: "92%" },
            { title: "Security Metric", value: "99.99%", color: "purple", width: "99%" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-neutral-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-neutral-700/50 transform hover:translate-y-[-8px] transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <span className={`px-3 py-1 bg-${item.color}-500/20 text-${item.color}-400 rounded-full text-sm`}>
                    {item.value}
                  </span>
                </div>
                <p className="text-neutral-400 mb-6">
                  Year-over-year increase in {item.title.toLowerCase()} across all segments.
                </p>
                <div className="h-12 w-full bg-neutral-700/30 rounded overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-400 w-[${item.width}] rounded`}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

