"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useInView, useAnimation } from "framer-motion"
import { ChevronDown, Mail, Phone, ArrowRight } from "lucide-react"

export default function Faq() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.2 })
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

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

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  const faqs = [
    {
      question: "How secure is my financial data?",
      answer:
        "Your data is protected with bank-level 256-bit encryption and multiple security layers including biometric authentication. We're compliant with all major financial security standards and perform regular security audits.",
    },
    {
      question: "What fees do you charge?",
      answer:
        "We offer transparent pricing with no hidden fees. Our standard plan starts at $19/month with all core features. Enterprise plans include custom pricing based on volume and features required.",
    },
    {
      question: "How do I get started?",
      answer:
        "Getting started takes less than 5 minutes. Sign up with your email, connect your accounts securely using our OAuth integration, and customize your dashboard preferences. Our onboarding wizard will guide you through each step.",
    },
    {
      question: "Can I integrate with other tools?",
      answer:
        "Yes, we offer comprehensive API access and native integrations with popular tools including QuickBooks, Xero, Stripe, PayPal, and major banking institutions. Our developer documentation provides implementation guides.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "We support all major credit/debit cards, ACH transfers, wire transfers, and digital wallets (Apple Pay, Google Pay). For enterprise clients, we also offer custom payment solutions and reconciliation services.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, we offer a 14-day full-featured trial with no credit card required. You'll have access to all platform features and dedicated support during your trial period to ensure you can properly evaluate our solution.",
    },
    {
      question: "What customer support options are available?",
      answer:
        "We offer 24/7 support via live chat, email, and phone. All customers receive access to our comprehensive knowledge base and video tutorials. Enterprise plans include a dedicated account manager.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time without penalty. We offer prorated refunds for unused service time. Your data remains available for export for 30 days after cancellation.",
    },
  ]

  return (
    <section id="faq" className="py-20 bg-neutral-900 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOEgxOHYxOGgxOFYxOHptNiAwaC02djZoNnYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-5 z-0"></div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-blue-400 font-medium mb-3 tracking-wide">QUESTIONS ANSWERED</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-300 text-lg">
            Get quick answers to the most common questions about our fintech platform.
          </p>
        </motion.div>

        {/* FAQ Grid Layout */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Left Column */}
          <div className="space-y-6">
            {faqs.slice(0, 4).map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item bg-neutral-800/50 backdrop-blur-md rounded-xl border border-neutral-700/50 overflow-hidden"
                variants={itemVariants}
              >
                <button
                  className="faq-question w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                  aria-expanded={activeIndex === index}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-blue-400 transform transition-transform duration-300 ${activeIndex === index ? "rotate-180" : ""}`}
                  />
                </button>
                <div className={`px-6 pb-5 transition-all duration-300 ${activeIndex === index ? "block" : "hidden"}`}>
                  <p className="text-neutral-300">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {faqs.slice(4).map((faq, index) => (
              <motion.div
                key={index + 4}
                className="faq-item bg-neutral-800/50 backdrop-blur-md rounded-xl border border-neutral-700/50 overflow-hidden"
                variants={itemVariants}
              >
                <button
                  className="faq-question w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                  aria-expanded={activeIndex === index + 4}
                  onClick={() => toggleFaq(index + 4)}
                >
                  <span className="text-lg font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-blue-400 transform transition-transform duration-300 ${activeIndex === index + 4 ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`px-6 pb-5 transition-all duration-300 ${activeIndex === index + 4 ? "block" : "hidden"}`}
                >
                  <p className="text-neutral-300">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Still Have Questions Section */}
        <motion.div
          className="mt-16 max-w-5xl mx-auto"
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
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Still have questions?</h3>
                <p className="text-neutral-300 mb-6">
                  Our team is ready to help you with any specific questions about our platform.
                </p>

                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <Mail className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400 mb-1">Email Us</div>
                      <a href="mailto:support@finedge.com" className="text-white hover:text-blue-400 transition-colors">
                        support@finedge.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                      <Phone className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm text-neutral-400 mb-1">Call Us</div>
                      <a href="tel:+18001234567" className="text-white hover:text-purple-400 transition-colors">
                        +1 (800) 123-4567
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 shadow-lg shadow-blue-600/25"
                >
                  Contact Support
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

