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
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Welcome Animation */}
      {showWelcomeAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-90">
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500">
                  <Wallet className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
            <h1 className="animate-pulse text-4xl font-bold text-white">Transaction Bot</h1>
            <p className="mt-2 text-gray-300">Your voice-powered financial assistant</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-800 bg-opacity-80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-emerald-500" />
            <h1 className="text-2xl font-bold">Transaction Bot</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 rounded-full bg-gray-700 px-3 py-2 text-sm transition-colors hover:bg-gray-600"
              >
                <Languages className="h-4 w-4" />
                <span>
                  {currentLanguage.flag} {currentLanguage.name}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => changeLanguage(language)}
                        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white hover:bg-gray-600"
                      >
                        <span>
                          {language.flag} {language.name}
                        </span>
                        {language.code === currentLanguage.code && <Check className="h-4 w-4 text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auto-detect Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">Auto-detect</span>
              <button
                onClick={() => setAutoDetect(!autoDetect)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoDetect ? "bg-emerald-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoDetect ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex flex-1 flex-col md:flex-row">
        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col p-4">
          {/* Messages Container */}
          <div className="mb-4 flex-1 overflow-y-auto rounded-lg bg-gray-800 p-4 shadow-lg">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.isUser ? "bg-violet-600 text-white" : "bg-gray-700 text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.text}</div>

                    {/* Audio playback for bot messages */}
                    {!message.isUser && message.audio && (
                      <button
                        onClick={() => toggleAudio(message.audio!)}
                        className="mt-2 flex items-center space-x-1 rounded-full bg-gray-600 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-500"
                      >
                        {isPlaying ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        <span>{isPlaying ? "Stop" : "Play"}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Audio Visualizer and Recording Controls */}
          <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
            <div className="mb-4 h-20 w-full">
              <canvas ref={visualizerRef} className="h-full w-full rounded-lg bg-gray-700"></canvas>
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                  isRecording ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"
                } ${isProcessing ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : isRecording ? (
                  <MicOff className="h-8 w-8 text-white" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-400">
              {isRecording
                ? "Tap to stop recording"
                : isProcessing
                  ? "Processing your message..."
                  : "Tap to start speaking"}
            </div>
          </div>
        </div>

        {/* Transaction Insights Panel */}
        <div className="w-full p-4 md:w-96">
          <div className="rounded-lg bg-gray-800 p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Transaction Insights</h2>
              <button
                onClick={generateRandomInsights}
                className="rounded-full bg-gray-700 p-2 transition-colors hover:bg-gray-600"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Account Summary */}
            <div className="mb-6 rounded-lg bg-gray-700 p-4">
              <div className="mb-2 flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold">Account Summary</h3>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-gray-600 p-2">
                  <div className="text-xs text-gray-400">Balance</div>
                  <div className="text-lg font-bold">₹45,250</div>
                </div>
                <div className="rounded-md bg-gray-600 p-2">
                  <div className="text-xs text-gray-400">Transactions</div>
                  <div className="text-lg font-bold">24</div>
                </div>
              </div>
            </div>

            {/* Spending Categories */}
            <div className="mb-6">
              <div className="mb-2 flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-violet-500" />
                <h3 className="font-semibold">Spending Categories</h3>
              </div>
              <div className="space-y-3">
                {transactionInsights.map((insight, index) => (
                  <div key={index}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{insight.category}</span>
                      <span>₹{insight.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
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
              <div className="mb-2 flex items-center space-x-2">
                <ArrowUpDown className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Recent Transactions</h3>
              </div>
              <div className="space-y-2">
                {[
                  { desc: "Grocery Store", amount: -2500, date: "2 days ago" },
                  { desc: "Salary Credit", amount: 45000, date: "5 days ago" },
                  { desc: "Electric Bill", amount: -1200, date: "1 week ago" },
                ].map((transaction, index) => (
                  <div key={index} className="rounded-md bg-gray-700 p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{transaction.desc}</div>
                        <div className="text-xs text-gray-400">{transaction.date}</div>
                      </div>
                      <div className={transaction.amount > 0 ? "text-emerald-500" : "text-rose-500"}>
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
    </main>
  )
}

