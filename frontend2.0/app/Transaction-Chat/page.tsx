"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Send, Loader2, IndianRupee, Mic } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Message {
  type: "user" | "bot"
  content: string
  timestamp: Date
}

export default function TransactionChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [transactionData, setTransactionData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newSessionId = crypto.randomUUID()
    setSessionId(newSessionId)
    initializeSession(newSessionId)
  }, [])

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      console.log("Initializing session:", sessionId);
      
      const response = await axios.post("http://localhost:5000/api/transactions/data", {
        session_id: sessionId
      });
      
      console.log("Session response:", response.data);
      
      if (response.data.status === "success") {
        setTransactionData(response.data.data);
        setMessages([{
          type: "bot",
          content: "I've analyzed your transactions. Ask me anything about your spending patterns, account balance, or specific transactions.",
          timestamp: new Date()
        }]);
      } else {
        throw new Error(response.data.message || "Failed to initialize session");
      }
    } catch (error) {
      console.error("Session initialization failed:", error);
      setMessages([{
        type: "bot",
        content: "I'm having trouble accessing your transaction data. Please try again later or contact support.",
        timestamp: new Date()
      }]);
      setTransactionData({
        transactions: [],
        account: { data: [{ mainBalance: 0 }] },
        analysis: { total_credits: 0, total_debits: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionId) return

    setIsLoading(true)
    setInputMessage("")
    setMessages(prev => [...prev, { type: "user", content: message, timestamp: new Date() }])

    try {
      const response = await axios.post("http://localhost:5000/api/transactions/chat", {
        session_id: sessionId,
        message: message
      })

      if (response.data.status === "success") {
        setMessages(prev => [...prev, {
          type: "bot",
          content: response.data.message,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [...prev, {
        type: "bot",
        content: "Sorry, I couldn't process that request. Please try again.",
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950/30">
      <div className="container mx-auto py-8 px-4">
        <div className="flex gap-6">
          {/* Chat Section */}
          <div className="flex-1">
            <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md shadow-lg rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <IndianRupee className="w-6 h-6" />
                    Transaction Analyst
                  </CardTitle>
                  
                  {/* Voice Service Button */}
                  <Button
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white flex items-center gap-2"
                    asChild
                  >
                    <a href="/Transaction-Chat/voice">
                      <Mic className="w-4 h-4" />
                      Voice Service
                    </a>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 h-[600px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex items-start gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.type === "bot" && (
                          <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-800">
                            <AvatarImage src="/transaction-bot.png" />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600">
                              <IndianRupee className="w-5 h-5 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <motion.div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                              : "bg-white dark:bg-gray-800 border border-blue-100 dark:border-indigo-900/30"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                </div>

                {/* Input Area */}
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputMessage) }}
                  className="p-6 border-t border-blue-100 dark:border-indigo-900/30 bg-white/90 dark:bg-gray-900/80">
                  <div className="flex gap-3">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask about your transactions..."
                      className="rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm pr-12"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Data Summary Sidebar */}
          <div className="w-96 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
                <CardTitle className="text-white">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {transactionData?.account && (
                  <>
                    <div className="flex justify-between">
                      <span>Current Balance:</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        ₹{transactionData.account.data[0].mainBalance.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Credits:</span>
                      <Badge className="bg-green-100 text-green-800">
                        ₹{transactionData.analysis?.total_credits || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Debits:</span>
                      <Badge className="bg-red-100 text-red-800">
                        ₹{transactionData.analysis?.total_debits || 0}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6">
                <CardTitle className="text-white">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                {transactionData?.transactions?.slice(0, 5).map((txn: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                    <span>{txn.description || 'Unknown transaction'}</span>
                    <span className={`font-medium ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{(Math.abs(txn.amount) || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}