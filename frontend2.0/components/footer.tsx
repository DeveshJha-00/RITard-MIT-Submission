"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Mail,
  Phone,
  ChevronUp,
  CreditCard,
  DollarSign,
  Shield,
} from "lucide-react"

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <footer id="footer" className="bg-neutral-900 pt-16 pb-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/5 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5 z-0"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info Column */}
          <div>
            {/* Logo */}
            <div className="mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="text-white text-xl font-bold">FinEdge</span>
              </div>
            </div>
            
            {/* Company Description */}
            <p className="text-neutral-400 mb-6">
              Revolutionizing financial technology with secure, intelligent solutions for businesses and individuals.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                aria-label="Twitter" 
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300 text-neutral-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="#" 
                aria-label="LinkedIn" 
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-blue-700 flex items-center justify-center transition-colors duration-300 text-neutral-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="#" 
                aria-label="GitHub" 
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors duration-300 text-neutral-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="#" 
                aria-label="Instagram" 
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-pink-600 flex items-center justify-center transition-colors duration-300 text-neutral-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
          
          {/* Quick Links Column */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {['Features', 'Solutions', 'Pricing', 'Testimonials', 'FAQ', 'Blog'].map((item, index) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link 
                    href={`#${item.toLowerCase()}`} 
                    className="text-neutral-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Contact', 'Press', 'Partners', 'Legal'].map((item, index) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link 
                    href={`#${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-neutral-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter Signup */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Stay Connected</h3>
            <p className="text-neutral-400 mb-6">
              Subscribe to our newsletter for the latest updates, features, and financial insights.
            </p>
            
            {/* Newsletter Form with floating input field */}
            <div className="relative bg-neutral-800/50 backdrop-blur-md p-1 rounded-lg border border-neutral-700/50 transform hover:translate-y-[-2px] transition-all duration-300 shadow-lg">
              <form className="flex flex-col sm:flex-row">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full sm:flex-grow py-3 px-4 bg-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
                <button 
                  type="submit" 
                  className="mt-2 sm:mt-0 sm:ml-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-colors duration-300"
                >
                  Subscribe
                </button>
              </form>
            </div>
            
            <p className="text-neutral-500 text-xs mt-3">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>
        
        {/* Brand Images */}
        <div className="mb-16">
          <h3 className="text-white text-lg font-semibold mb-6 text-center">Our Technology Stack</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <motion.div 
                key={index}
                className="bg-neutral-800/50 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center h-16 border border-neutral-700/50 grayscale hover:grayscale-0 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="h-8 w-8 text-neutral-400 flex items-center justify-center">
                  {[
                    <CreditCard key="1" className="h-8 w-8" />,
                    <DollarSign key="2" className="h-8 w-8" />,
                    <Shield key="3" className="h-8 w-8" />,
                    <Mail key="4" className="h-8 w-8" />,
                    <Phone key="5" className="h-8 w-8" />,
                    <Github key="6" className="h-8 w-8" />
                  ][index - 1]}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Mini Product Showcase with Image */}
        <div className="mb-16">
          <div className="bg-neutral-800/40 backdrop-blur-md rounded-2xl overflow-hidden border border-neutral-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <h3 className="text-white text-xl md:text-2xl font-bold mb-4">
                  Our Mobile App
                </h3>
                <p className="text-neutral-400 mb-6">
                  Take your financial management on the go with our powerful mobile application.
                </p>
                <div className="flex flex-wrap gap-4">
                  <motion.a 
                    href="#" 
                    className="flex items-center bg-neutral-800 hover:bg-neutral-700 rounded-xl px-4 py-2 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-neutral-300 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 17.607c-.786 2.28-3.139 6.317-5.563 6.361-1.608.031-2.125-.953-3.963-.953-1.837 0-2.412.923-3.932.983-2.572.099-6.542-5.827-6.542-10.995 0-4.747 3.308-7.1 6.198-7.143 1.55-.028 3.014 1.045 3.959 1.045.949 0 2.727-1.29 4.596-1.101.782.033 2.979.315 4.389 2.377-3.741 2.442-3.158 7.549.858 9.426zm-5.222-17.607c-2.826.114-5.132 3.079-4.81 5.531 2.612.203 5.118-2.725 4.81-5.531z"></path>
                    </svg>
                    <div>
                      <div className="text-xs text-neutral-400">Download on the</div>
                      <div className="text-sm font-medium text-white">App Store</div>
                    </div>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="flex items-center bg-neutral-800 hover:bg-neutral-700 rounded-xl px-4 py-2 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-neutral-300 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 20.571V3.429c0-.481.196-.943.544-1.286l.02-.019C3.894 1.788 4.34 1.571 4.8 1.571h14.4c.46 0 .906.217 1.236.553l.02.019c.348.343.544.805.544 1.286v17.143c0 .481-.196.943-.544 1.286l-.02.019c-.33.336-.776.553-1.236.553H4.8c-.46 0-.906-.217-1.236-.553l-.02-.019C3.196 21.514 3 21.052 3 20.571zm12-9.571c.66 0 1.185-.315 1.575-.973h.002L20.412 4h-1.786l-3.187 5.127c-.09.143-.183.276-.358.276-.176 0-.272-.133-.36-.276L11.545 4H9.757l3.835 6.027c.391.658.916.973 1.576.973zm1.833 2.854a2.786 2.786 0 0 1 2.167 2.167h1.5a4.286 4.286 0 0 0-3.667-3.667v1.5zm.834 2.167a1.38 1.38 0 0 0-1.334-1.333v-1.5a2.78 2.78 0 0 1 2.834 2.833h-1.5zm-10.334-1.333a2.786 2.786 0 0 0-2.166 2.166h-1.5a4.286 4.286 0 0 1 3.666-3.666v1.5zm-.833 2.166a1.38 1.38 0 0 1 1.333-1.333v-1.5a2.78 2.78 0 0 0-2.833 2.833h1.5z"></path>
                    </svg>
                    <div>
                      <div className="text-xs text-neutral-400">GET IT ON</div>
                      <div className="text-sm font-medium text-white">Google Play</div>
                    </div>
                  </motion.a>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="https://www.softwareistic.com/assets/images/fintech.png"
                  alt="Modern desktop setup with Apple devices showcasing the app"
                  width={1080}
                  height={720}
                  className="w-full h-full object-cover"
                />
                {/* Photo credit */}
                <div className="absolute bottom-4 right-4 bg-neutral-900/70 backdrop-blur-sm py-1 px-3 rounded-full">
                  <p className="text-neutral-400 text-xs">Photo by FinEdge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} FinEdge. All rights reserved.
            </div>
            
            <div className="flex space-x-6">
              <Link href="#privacy" className="text-neutral-500 hover:text-blue-400 text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-neutral-500 hover:text-blue-400 text-sm transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="#cookies" className="text-neutral-500 hover:text-blue-400 text-sm transition-colors duration-300">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back to top button */}
      <motion.button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg z-50 transition-all duration-300 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Back to top"
      >
        <ChevronUp className="h-6 w-6" />
      </motion.button>
    </footer>
  )
}

