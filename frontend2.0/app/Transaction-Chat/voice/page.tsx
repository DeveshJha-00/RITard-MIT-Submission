"use client"

import { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import {
  Mic,
  MicOff,
  Languages,
  Volume2,
  VolumeX,
  BarChart3,
  CreditCard,
  Wallet,
  ArrowUpDown,
  Loader2,
  ChevronDown,
  Check,
  RefreshCw,
  LineChart,
} from "lucide-react"

// Define types
type Language = {
  code: string
  name: string
  flag: string
}

type Message = {
  text: string
  isUser: boolean
  timestamp: string
  audio?: string
  language?: string
}

type TransactionInsight = {
  category: string
  amount: number
  percentage: number
  color: string
}

export default function VoiceTransactionBot() {
  // Socket and recording state
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [autoDetect, setAutoDetect] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<Language>({
    code: "en-IN",
    name: "English",
    flag: "🇮🇳",
  })
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true)
  const [transactionInsights, setTransactionInsights] = useState<TransactionInsight[]>([
    { category: "Food", amount: 12500, percentage: 25, color: "bg-emerald-500" },
    { category: "Shopping", amount: 10000, percentage: 20, color: "bg-violet-500" },
    { category: "Transport", amount: 7500, percentage: 15, color: "bg-amber-500" },
    { category: "Bills", amount: 15000, percentage: 30, color: "bg-rose-500" },
    { category: "Others", amount: 5000, percentage: 10, color: "bg-blue-500" },
  ])

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const visualizerRef = useRef<HTMLCanvasElement>(null)
  const visualizerCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Available languages
  const languages: Language[] = [
    { code: "en-IN", name: "English", flag: "🇮🇳" },
    { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
    { code: "ta-IN", name: "Tamil", flag: "🇮🇳" },
    { code: "te-IN", name: "Telugu", flag: "🇮🇳" },
    { code: "bn-IN", name: "Bengali", flag: "🇮🇳" },
    { code: "mr-IN", name: "Marathi", flag: "🇮🇳" },
    { code: "kn-IN", name: "Kannada", flag: "🇮🇳" },
    { code: "ml-IN", name: "Malayalam", flag: "🇮🇳" },
    { code: "gu-IN", name: "Gujarati", flag: "🇮🇳" },
  ]

  // Initialize socket connection
  useEffect(() => {
    // In a real app, you would connect to your actual server
    const newSocket = io("http://localhost:8000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on("connect", () => {
      console.log("Connected to server")
      setIsConnected(true)

      // Add welcome message
      setMessages([
        {
          text: "Hello! I'm your Transaction Bot. I can help you analyze your spending, check account balances, and provide financial advice. Just press the microphone button and start speaking.",
          isUser: false,
          timestamp: new Date().toISOString(),
          language: "en-IN",
        },
      ])
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server")
      setIsConnected(false)
    })

    newSocket.on("response", (data) => {
      console.log("Received response:", data)
      setIsProcessing(false)

      // Add bot message
      setMessages((prev) => [
        ...prev,
        {
          text: data.text,
          isUser: false,
          timestamp: data.timestamp,
          audio: data.audio,
          language: data.language,
        },
      ])

      // Auto-play the response
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`)
        setCurrentAudio(audio)
        audio.onplay = () => setIsPlaying(true)
        audio.onended = () => setIsPlaying(false)
        audio.play()
      }

      // Generate random transaction insights for demo
      generateRandomInsights()
    })

    newSocket.on("detected_language", (data) => {
      console.log("Detected language:", data)
      const detectedLang = languages.find((lang) => lang.code === data.language)
      if (detectedLang) {
        setCurrentLanguage(detectedLang)
      }
    })

    newSocket.on("error", (error) => {
      console.error("Socket error:", error)
      setIsProcessing(false)

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${error.message || "Something went wrong. Please try again."}`,
          isUser: false,
          timestamp: new Date().toISOString(),
          language: "en-IN",
        },
      ])
    })

    setSocket(newSocket)

    // Hide welcome animation after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false)
    }, 3000)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      newSocket.disconnect()
      clearTimeout(timer)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize canvas for visualizer
  useEffect(() => {
    if (visualizerRef.current) {
      visualizerCtxRef.current = visualizerRef.current.getContext("2d")

      // Set canvas dimensions
      const resizeCanvas = () => {
        if (visualizerRef.current) {
          visualizerRef.current.width = visualizerRef.current.offsetWidth
          visualizerRef.current.height = visualizerRef.current.offsetHeight
        }
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      return () => {
        window.removeEventListener("resize", resizeCanvas)
      }
    }
  }, [])

  // Function to generate random transaction insights for demo
  const generateRandomInsights = () => {
    const categories = ["Food", "Shopping", "Transport", "Bills", "Entertainment", "Health", "Travel", "Others"]
    const colors = [
      "bg-emerald-500",
      "bg-violet-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-cyan-500",
    ]

    let total = 0
    const newInsights: TransactionInsight[] = []

    // Generate 5 random categories
    const selectedCategories = [...categories].sort(() => 0.5 - Math.random()).slice(0, 5)

    selectedCategories.forEach((category, index) => {
      const amount = Math.floor(Math.random() * 20000) + 5000
      total += amount
      newInsights.push({
        category,
        amount,
        percentage: 0, // Will calculate after total is known
        color: colors[index % colors.length],
      })
    })

    // Calculate percentages
    newInsights.forEach((insight) => {
      insight.percentage = Math.round((insight.amount / total) * 100)
    })

    setTransactionInsights(newInsights)
  }

  // Start recording function
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)

      // Set up audio context and analyzer for visualization
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext()
      }

      const audioContext = audioContextRef.current
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      analyserRef.current = analyser

      // Start visualization
      visualize()

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)

        // Convert to base64 and send to server
        const reader = new FileReader()
        reader.readAsDataURL(audioBlob)
        reader.onloadend = () => {
          const base64Audio = reader.result?.toString().split(",")[1]

          if (base64Audio && socket) {
            setIsProcessing(true)

            // Add user message placeholder
            setMessages((prev) => [
              ...prev,
              {
                text: "...",
                isUser: true,
                timestamp: new Date().toISOString(),
                language: currentLanguage.code,
              },
            ])

            socket.emit("audio_message", {
              audio: base64Audio,
              language: currentLanguage.code,
              auto_detect: autoDetect,
            })
          }
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all tracks on the stream
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
        setAudioStream(null)
      }

      // Stop visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      // Clear canvas
      if (visualizerCtxRef.current && visualizerRef.current) {
        visualizerCtxRef.current.clearRect(0, 0, visualizerRef.current.width, visualizerRef.current.height)
      }
    }
  }

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Play/pause audio response
  const toggleAudio = (audio: string) => {
    if (isPlaying && currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setIsPlaying(false)
    } else {
      const audioElement = new Audio(`data:audio/wav;base64,${audio}`)
      setCurrentAudio(audioElement)
      audioElement.onplay = () => setIsPlaying(true)
      audioElement.onended = () => setIsPlaying(false)
      audioElement.play()
    }
  }

  // Visualize audio input
  const visualize = () => {
    if (!analyserRef.current || !visualizerCtxRef.current || !visualizerRef.current) {
      return
    }

    const analyser = analyserRef.current
    const ctx = visualizerCtxRef.current
    const canvas = visualizerRef.current

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!ctx || !canvas) return

      animationFrameRef.current = requestAnimationFrame(draw)

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, "#10b981") // emerald-500
        gradient.addColorStop(1, "#8b5cf6") // violet-500

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()
  }

  // Change language
  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language)
    setIsLanguageMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950/30 pt-24">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 w-full">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Mic className="w-6 h-6" />
                    Voice Transaction Assistant
                  </h1>
                  <div className="relative">
                    <button
                      onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 py-2 px-4 rounded-md text-white transition-colors"
                    >
                      <span className="text-lg">{currentLanguage.flag}</span>
                      <span>{currentLanguage.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isLanguageMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-detect</span>
                            <button
                              onClick={() => setAutoDetect(!autoDetect)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                                autoDetect ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-700"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transform transition-transform ${
                                  autoDetect ? "translate-x-4" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto py-1">
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                currentLanguage.code === lang.code ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"
                              }`}
                              onClick={() => {
                                changeLanguage(lang)
                                setIsLanguageMenuOpen(false)
                              }}
                            >
                              <span className="text-lg">{lang.flag}</span>
                              <span>{lang.name}</span>
                              {currentLanguage.code === lang.code && <Check className="ml-auto w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Area */}
              <div className="h-[400px] overflow-y-auto p-6 bg-white dark:bg-gray-800">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.isUser
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      {message.audio && (
                        <button
                          className={`mt-2 flex items-center gap-1 text-xs ${
                            message.isUser
                              ? "text-white/80 hover:text-white"
                              : "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          }`}
                          onClick={() => toggleAudio(message.audio!)}
                        >
                          {isPlaying && currentAudio?.src?.includes(message.audio) ? (
                            <>
                              <VolumeX className="w-3 h-3" /> Stop Audio
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" /> Play Audio
                            </>
                          )}
                        </button>
                      )}
                      <div className="mt-1 text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                        {message.language && (
                          <span className="ml-2">
                            {languages.find((l) => l.code === message.language)?.flag || ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Visualizer and Controls */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
                <div className="relative h-24 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <canvas ref={visualizerRef} className="w-full h-full" />
                  {!isRecording && !isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      Speak to analyze your finances
                    </div>
                  )}
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Processing your request...
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={toggleRecording}
                    disabled={isProcessing}
                    className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white disabled:opacity-50 disabled:pointer-events-none`}
                  >
                    {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Insights Panel */}
          <div className="lg:w-1/3 w-full">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <LineChart className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                    Transaction Insights
                  </h2>
                  <button
                    onClick={generateRandomInsights}
                    className="rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 transition-colors text-gray-600 dark:text-gray-300"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>

                {/* Account Summary */}
                <div className="mb-6 rounded-xl bg-blue-50 dark:bg-gray-700/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Account Summary</h3>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-white/80 dark:bg-gray-800/80 p-3 shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">₹45,250</div>
                    </div>
                    <div className="rounded-md bg-white/80 dark:bg-gray-800/80 p-3 shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Transactions</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">24</div>
                    </div>
                  </div>
                </div>

                {/* Spending Categories */}
                <div className="mb-6">
                  <div className="mb-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Spending Categories</h3>
                  </div>
                  <div className="space-y-3">
                    {transactionInsights.map((insight, index) => (
                      <div key={index}>
                        <div className="mb-1 flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                          <span>{insight.category}</span>
                          <span>₹{insight.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-full ${insight.color} transition-all duration-500`}
                            style={{ width: `${insight.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Recent Transactions</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { desc: "Grocery Store", amount: -2500, date: "2 days ago" },
                      { desc: "Salary Credit", amount: 45000, date: "5 days ago" },
                      { desc: "Electric Bill", amount: -1200, date: "1 week ago" },
                    ].map((transaction, index) => (
                      <div key={index} className="rounded-md bg-gray-100 dark:bg-gray-700 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">{transaction.desc}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.date}</div>
                          </div>
                          <div className={transaction.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                            {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

