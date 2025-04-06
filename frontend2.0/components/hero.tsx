"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView, useAnimation } from "framer-motion"
import { Check, TrendingUp } from "lucide-react"
import Squares from './reactbits/Backgrounds/Squares/Squares';
import Orb from './reactbits/Backgrounds/Orb/Orb';

export default function Hero() {
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

  const floatingVariants = {
    hidden: { y: 0, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.8,
        duration: 0.5,
      },
    },
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  }

  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-16 overflow-hidden bg-neutral-900 dark:bg-gray-900 text-white flex items-center justify-center">
      {/* Squares Animation - Position it behind other elements */}
      <div className="absolute inset-0 z-0">
        <Squares 
          speed={0.5} 
          squareSize={40}
          direction='diagonal'
          borderColor='rgba(255,255,255,0.05)'
          hoverFillColor='rgba(59, 130, 246, 0.1)'
        />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20 z-10">
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-blue-500 dark:bg-blue-600 blur-3xl -top-32 -left-20"
          animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute w-[30rem] h-[30rem] rounded-full bg-cyan-400 dark:bg-cyan-500 blur-3xl -bottom-20 -right-20"
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
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-purple-500 dark:bg-purple-600 blur-3xl top-1/4 -right-10"
          animate={{
        scale: [1, 1.15, 1],
        opacity: [0.5, 0.75, 0.5],
          }}
          transition={{
        duration: 9,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
        delay: 2,
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMzZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10 z-20" />

      <div className="container mx-auto px-6 md:px-12 relative z-30">
        {/* Add Orb background */}
        <div className="absolute inset-0 z-0" style={{ height: '300%', width: '150%', left: '-25%', top: '-100%' }}>
          <Orb
        hoverIntensity={0.5}
        rotateOnHover={true}
        hue={400}
        forceHoverState={false}
          />
        </div>

        <motion.div
          ref={ref}
          className="relative z-10 flex flex-col items-center text-center max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Text Content - Centered */}
          <div className="w-full md:max-w-3xl mb-12">
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
          variants={itemVariants}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 dark:from-blue-300 dark:to-cyan-200">
            Reimagine
          </span>{" "}
          Financial Freedom
        </motion.h1>
        <motion.p className="text-xl md:text-2xl text-gray-300 dark:text-gray-200 mb-8" variants={itemVariants}>
          Plan | Prepare | Manage
        </motion.p>
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={itemVariants}>
          <Link
            href="/FinWise"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-600 dark:to-cyan-500 rounded-full text-white font-bold text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Get Started
          </Link>
          <Link
            href="#howitworks"
            className="px-8 py-4 bg-neutral-800 dark:bg-gray-800 border border-neutral-700 dark:border-gray-700 backdrop-blur-lg rounded-full text-white font-bold text-center transition-all duration-300 hover:bg-neutral-700 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            How It Works
          </Link>
        </motion.div>
          </div>

          {/* Image/Illustration - Centered */}
          <div className="w-full max-w-2xl mx-auto">
            <motion.div className="relative w-full max-w-lg mx-auto" variants={itemVariants}>
              {/* Main Image with Glass Card Overlay */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
        
                {/* Glass Card Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-900 dark:to-gray-900 opacity-60" />

                {/* Glass Card Stats */}
                <div className="absolute bottom-0 left-0 right-0 p-6 backdrop-blur-sm bg-neutral-900/30 dark:bg-gray-900/30 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-cyan-300 dark:text-cyan-200 uppercase tracking-wider mb-1">Account Balance</p>
                      <p className="text-2xl font-bold">Rs 32,  24,567.89</p>
                    </div>
                    <div className="flex items-center text-green-400 dark:text-green-300">
                      <TrendingUp className="h-5 w-5 mr-1" />
                      <span className="font-medium">+16.8%</span>
                    </div>
                  </div>
                </div>
              </div>

              
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#171717"
            fillOpacity="1"
            d="M0,96L40,90.7C80,85,160,75,240,74.7C320,75,400,85,480,90.7C560,96,640,96,720,90.7C800,85,880,75,960,69.3C1040,64,1120,64,1200,69.3C1280,75,1360,85,1400,90.7L1440,96L1440,120L1400,120C1360,120,1280,120,1200,120C1120,120,1040,120,960,120C880,120,800,120,720,120C640,120,560,120,480,120C400,120,320,120,240,120C160,120,80,120,40,120L0,120Z"
            className="dark:fill-gray-900"
          ></path>
        </svg>
      </div>
    </section>
  )
}

