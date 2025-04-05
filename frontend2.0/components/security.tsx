"use client"

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Shield, Lock, CheckCircle } from 'lucide-react'

export default function Security() {
  const features = [
    {
      title: "Bank-Level Security",
      description: "We implement 256-bit encryption and multiple security layers to protect your financial data.",
      icon: Shield,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Secure Authentication",
      description: "Multi-factor authentication and biometric login options keep your account safe.",
      icon: Lock,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Compliance Standards",
      description: "We adhere to international security standards and regular security audits.",
      icon: CheckCircle,
      color: "from-green-500 to-green-600"
    }
  ]

  return (
    <section id="security" className="py-20 bg-neutral-900 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Enterprise-Grade Security for Your Financial Data
          </motion.h2>
          <motion.p 
            className="text-neutral-400 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Your security is our top priority. We employ industry-leading security measures to protect your sensitive information.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-neutral-800/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-700/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-neutral-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>  
    </section>
  )
}

