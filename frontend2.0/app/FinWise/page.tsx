"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import {
  Send,
  Loader2,
  User,
  RefreshCw,
  Wifi,
  WifiOff,
  Moon,
  Sun,
  DollarSign,
  PieChart,
  TrendingUp,
  IndianRupee,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

// Create these components in separate files
import { InvestmentCalculator } from "@/components/InvestmentCalculator"
import { TaxPlanner } from "@/components/TaxPlanner"
import { FinancialGoals } from "@/components/FinancialGoals"

interface Message {
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface ChatResponse {
  status: string
  message: string
  suggestions?: string[]
  crisis?: boolean
  resources?: {
    message: string
    resources: Array<{
      name: string
      contact: string
      available: string
    }>
  }
}

export default function FinWisePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionChecking, setConnectionChecking] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  const page = {
    title: "FinWise",
    description: "Your AI Financial Assistant",
  }

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme === "dark" ? "dark" : "light")
  }, [theme])

  const checkConnection = async () => {
    try {
      setConnectionChecking(true)
      const response = await axios.post("http://localhost:5000/api/finance/start", {
        user_info: {},
        session_id: sessionId,
      })

      const data = response.data
      console.log("Backend connection response:", data)

      if (data.status === "success") {
        setSessionId(data.session_id)
        setMessages((prev) => [...prev, { type: "bot", content: data.message, timestamp: new Date() }])
        setSuggestions(data.suggestions || [])
        setIsConnected(true)
      }
    } catch (error) {
      console.error("Backend connection failed:", error)
      setIsConnected(false)
    } finally {
      setConnectionChecking(false)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionId || !isConnected) return

    setIsLoading(true)
    setInputMessage("")
    setMessages((prev) => [...prev, { type: "user", content: message, timestamp: new Date() }])

    try {
      setIsTyping(true)
      const response = await axios.post("http://localhost:5000/api/finance/message", {
        session_id: sessionId,
        message,
      })

      const data: ChatResponse = response.data
      console.log("Message response from backend:", data)

      setIsTyping(false)
      if (data.status === "success") {
        setMessages((prev) => [...prev, { type: "bot", content: data.message, timestamp: new Date() }])
        setSuggestions(data.suggestions || [])

        if (data.crisis && data.resources) {
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              content: data.resources.message,
              timestamp: new Date(),
            },
            ...data.resources.resources.map((resource) => ({
              type: "bot",
              content: `${resource.name}: ${resource.contact} (Available: ${resource.available})`,
              timestamp: new Date(),
            })),
          ])
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            content: data.message || "An error occurred.",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ])
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const endChat = async () => {
    try {
      if (sessionId) {
        await axios.post("http://localhost:5000/api/finance/end", {
          session_id: sessionId,
        })
      }
    } catch (error) {
      console.error("Error ending chat:", error)
    }
  }

  useEffect(() => {
    checkConnection()
    return () => {
      endChat()
    }
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      sendMessage(inputMessage)
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-teal-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-indigo-950/30 transition-all duration-700">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm py-4 px-6 border-b border-teal-100 dark:border-indigo-900/30"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.02 }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full blur-sm opacity-70"></div>
              <Avatar className="h-10 w-10 relative">
                <AvatarImage src="/finwise-logo.png" alt="FinWise" />
                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600">
                  <IndianRupee className="h-5 w-5 text-white" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 dark:from-teal-400 dark:to-purple-400 bg-clip-text text-transparent">
                FinWise
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your AI Financial Assistant</p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-3">
            <Badge
              variant="outline"
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-teal-200 dark:border-indigo-800 px-3 py-1 text-xs"
            >
              <span className="mr-1 text-teal-600 dark:text-teal-400">v</span>
              <span className="text-gray-600 dark:text-gray-300">1.0</span>
            </Badge>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border border-teal-100 dark:border-indigo-800/50 text-gray-800 dark:text-gray-200 focus:outline-none transition-all duration-300"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={checkConnection}
              className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border border-teal-100 dark:border-indigo-800/50 text-gray-800 dark:text-gray-200 focus:outline-none transition-all duration-300"
            >
              {connectionChecking ? (
                <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
              ) : isConnected ? (
                <Wifi className="w-5 h-5 text-teal-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chat Section - 65% width */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-[95%]"
          >
            <div className="relative h-[calc(100vh-8rem)]">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 via-purple-400/10 to-indigo-400/20 dark:from-teal-900/20 dark:via-purple-900/10 dark:to-indigo-900/20 rounded-2xl blur-xl"></div>
              <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/70 border-0 shadow-lg rounded-2xl overflow-hidden relative h-full flex flex-col">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-purple-600 p-4 lg:p-6 flex-shrink-0">
                  <CardTitle className="text-2xl font-bold text-white">FinWise Chat</CardTitle>
                  <CardDescription className="text-teal-100">
                    Ask me anything about personal finance in India
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 flex-grow overflow-hidden">
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500/20 hover:scrollbar-thumb-teal-500/30 scrollbar-track-transparent">
                    <div className="p-4 lg:p-6 space-y-6">
                      <AnimatePresence>
                        {!isConnected && !connectionChecking && (
                          <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Alert
                              variant="destructive"
                              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                            >
                              <AlertDescription className="text-red-800 dark:text-red-300">
                                Connection to server lost. Please check your connection and try again.
                              </AlertDescription>
                            </Alert>
                          </motion.div>
                        )}

                        {messages.map((message, index) => (
                          <motion.div
                            key={index}
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            transition={{ delay: index * 0.1 }}
                            className={`flex items-start gap-4 ${
                              message.type === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            {message.type === "bot" && (
                              <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full blur-sm opacity-70"></div>
                                <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-800 relative">
                                  <AvatarImage src="/finwise-logo.png" alt="FinWise" />
                                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600">
                                    <IndianRupee className="w-5 h-5 text-white" />
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}

                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                                message.type === "user"
                                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white self-end"
                                  : "bg-white dark:bg-gray-800 border border-teal-100 dark:border-indigo-900/30 self-start"
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                              <span
                                className={`text-xs mt-2 block ${
                                  message.type === "user" ? "text-teal-100" : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </motion.div>

                            {message.type === "user" && (
                              <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full blur-sm opacity-70"></div>
                                <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-800 relative">
                                  <AvatarImage src="/placeholder-user.jpg" alt="User" />
                                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600">
                                    <User className="w-5 h-5 text-white" />
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                          </motion.div>
                        ))}

                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start gap-4"
                          >
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full blur-sm opacity-70"></div>
                              <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-800 relative">
                                <AvatarImage src="/finwise-logo.png" alt="FinWise" />
                                <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600">
                                  <IndianRupee className="w-5 h-5 text-white" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-full px-5 py-3 shadow-sm border border-teal-100 dark:border-indigo-900/30">
                              <motion.div
                                animate={{
                                  scale: [1, 1.1, 1],
                                  transition: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 },
                                }}
                                className="flex space-x-2"
                              >
                                <motion.div
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0 }}
                                  className="w-2 h-2 bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"
                                />
                                <motion.div
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.2 }}
                                  className="w-2 h-2 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
                                />
                                <motion.div
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.4 }}
                                  className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full"
                                />
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div ref={messagesEndRef} className="h-px" />
                    </div>
                  </div>
                </CardContent>

                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="px-6 py-3 bg-gradient-to-r from-teal-50/80 to-purple-50/80 dark:from-gray-800/50 dark:to-gray-800/50 backdrop-blur-sm border-t border-teal-100 dark:border-indigo-900/30"
                  >
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onClick={() => sendMessage(suggestion)}
                          className="whitespace-nowrap px-4 py-2 bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-300 
                               rounded-full transition-all duration-300 text-xs font-medium
                               focus:outline-none border border-teal-200 dark:border-teal-800
                               shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700"
                          disabled={!isConnected}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="p-4 lg:p-6 border-t border-teal-100 dark:border-indigo-900/30 bg-gradient-to-r from-white/80 to-white/90 dark:from-gray-900/80 dark:to-gray-900/90 backdrop-blur-sm"
                >
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={
                          isConnected ? "Ask FinWise about personal finance in India..." : "Waiting for connection..."
                        }
                        className="pr-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-teal-200 dark:border-indigo-800/50 rounded-full h-12 pl-5
                             placeholder-gray-400 focus:outline-none focus:ring-2 
                             focus:ring-teal-500 focus:border-transparent shadow-sm transition-all duration-300"
                        disabled={isLoading || !isConnected}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading || !inputMessage.trim() || !isConnected}
                        className="absolute right-1 top-1 rounded-full bg-gradient-to-r from-teal-500 to-purple-600 text-white
                             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 h-10 w-10
                             flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-md"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </motion.button>
                    </div>
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 1 }}
                    className="text-xs font-medium text-center text-gray-500 dark:text-gray-400 mt-3"
                  >
                    FinWise can make mistakes. Consider verifying important financial information.
                  </motion.p>
                </form>
              </Card>
            </div>
          </motion.div>

          {/* Tools Section - 35% width */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-[35%] space-y-6"
          >
            {/* Financial Tools Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-indigo-400/10 to-teal-400/20 dark:from-purple-900/20 dark:via-indigo-900/10 dark:to-teal-900/20 rounded-2xl blur-xl"></div>
              <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/70 border-0 shadow-lg rounded-2xl overflow-hidden relative">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Tabs defaultValue="investment" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-teal-50/50 dark:bg-gray-800/50 p-1 rounded-lg">
                      <TabsTrigger
                        value="tax"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-300 rounded-md transition-all duration-300"
                      >
                       <IndianRupee className="w-4 h-4 mr-2" />

                        Tax
                      </TabsTrigger>
                      <TabsTrigger
                        value="investment"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 rounded-md transition-all duration-300"
                      >
                      <PieChart className="w-4 h-4 mr-2" />                        Invest

                      </TabsTrigger>
                      <TabsTrigger
                        value="goals"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 rounded-md transition-all duration-300"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Goals
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="tax" className="mt-4">
                      <TaxPlanner />
                    </TabsContent>
                    <TabsContent value="investment" className="mt-4">
                      <InvestmentCalculator />
                    </TabsContent>
                    
                    <TabsContent value="goals" className="mt-4">
                      <FinancialGoals />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

        
          </motion.div>
        </div>
      </main>
    </div>
  )
}

