"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { IndianRupee, Calculator } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function InvestmentCalculator() {
  const [principal, setPrincipal] = useState<number>(10000)
  const [rate, setRate] = useState<number>(12)
  const [time, setTime] = useState<number>(5)
  const [result, setResult] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateSIP = () => {
    setIsCalculating(true)

    // Simulate calculation delay for animation
    setTimeout(() => {
      // SIP calculation formula: M × {[(1 + r)^n - 1] / r} × (1 + r)
      // Where M is the monthly investment amount, r is the monthly interest rate, and n is the number of months
      const monthlyRate = rate / 100 / 12
      const months = time * 12
      const amount = principal * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
      setResult(Math.round(amount))
      setIsCalculating(false)
    }, 800)
  }

  // Format number with commas for Indian numbering system
  const formatIndianNumber = (num: number) => {
    return num.toLocaleString("en-IN")
  }

  return (
    <Card className="border-0 shadow-none overflow-hidden bg-gradient-to-br from-teal-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
      <CardContent className="p-5 space-y-5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="space-y-3">
            <Label htmlFor="principal" className="text-teal-800 dark:text-teal-300 font-medium flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Monthly Investment (₹)
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <IndianRupee className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="pl-10 bg-white/70 dark:bg-gray-800/70 border-teal-200 dark:border-teal-800/50 focus:border-teal-400 dark:focus:border-teal-600 focus:ring-teal-400 dark:focus:ring-teal-600 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="rate" className="text-teal-800 dark:text-teal-300 font-medium">
                Expected Return (%)
              </Label>
              <motion.span
                key={rate}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-medium px-2 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-md"
              >
                {rate}%
              </motion.span>
            </div>
            <Slider
              id="rate"
              min={1}
              max={30}
              step={0.5}
              value={[rate]}
              onValueChange={(value) => setRate(value[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="time" className="text-teal-800 dark:text-teal-300 font-medium">
                Time Period
              </Label>
              <motion.span
                key={time}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-medium px-2 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-md"
              >
                {time} {time === 1 ? "year" : "years"}
              </motion.span>
            </div>
            <Slider
              id="time"
              min={1}
              max={30}
              step={1}
              value={[time]}
              onValueChange={(value) => setTime(value[0])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              <span>Short Term</span>
              <span>Long Term</span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={calculateSIP}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg h-11 font-medium shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                >
                  <span>Calculating</span>
                  <span className="flex gap-1">
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0 }}
                      className="w-1 h-1 bg-white rounded-full inline-block"
                    />
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.2 }}
                      className="w-1 h-1 bg-white rounded-full inline-block"
                    />
                    <motion.span
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.6, delay: 0.4 }}
                      className="w-1 h-1 bg-white rounded-full inline-block"
                    />
                  </span>
                </motion.div>
              ) : (
                <span className="flex items-center gap-2">
                  Calculate <Calculator className="w-4 h-4" />
                </span>
              )}
            </Button>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {result !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="mt-5 overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-teal-100/80 to-teal-50/80 dark:from-teal-900/30 dark:to-teal-800/30 rounded-xl border border-teal-200/50 dark:border-teal-800/50 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-teal-800 dark:text-teal-300">Estimated Future Value:</h3>
                  <div className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/50 px-2 py-1 rounded-full border border-teal-100 dark:border-teal-800/50">
                    {time} {time === 1 ? "year" : "years"}
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="flex items-center gap-2 mb-3"
                >
                  <IndianRupee className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-teal-500 dark:from-teal-300 dark:to-teal-500 bg-clip-text text-transparent">
                    {formatIndianNumber(result)}
                  </span>
                </motion.div>

                <div className="space-y-2 pt-2 border-t border-teal-200/50 dark:border-teal-800/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Total Investment:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      ₹{formatIndianNumber(principal * time * 12)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Estimated Returns:</span>
                    <span className="font-medium text-teal-600 dark:text-teal-400">
                      ₹{formatIndianNumber(result - principal * time * 12)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Wealth Gain:</span>
                    <span className="font-medium text-teal-600 dark:text-teal-400">
                      {Math.round((result / (principal * time * 12) - 1) * 100)}%
                    </span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg"
                >
                  <p>
                    This is an estimate based on constant returns. Actual returns may vary based on market conditions.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

