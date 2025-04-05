"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IndianRupee, Calculator, ArrowRightLeft, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function TaxPlanner() {
  const [income, setIncome] = useState<number>(1000000)
  const [section80C, setSection80C] = useState<number>(150000)
  const [section80D, setSection80D] = useState<number>(25000)
  const [housingLoan, setHousingLoan] = useState<number>(200000)
  const [oldRegimeTax, setOldRegimeTax] = useState<number | null>(null)
  const [newRegimeTax, setNewRegimeTax] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Format number with commas for Indian numbering system
  const formatIndianNumber = (num: number) => {
    return num.toLocaleString("en-IN")
  }

  const calculateTax = () => {
    setIsCalculating(true)

    // Simulate calculation delay for animation
    setTimeout(() => {
      // Old Regime Tax Calculation (simplified)
      const taxableIncomeOld =
        income - Math.min(section80C, 150000) - Math.min(section80D, 50000) - Math.min(housingLoan, 200000)
      let oldTax = 0

      if (taxableIncomeOld > 1000000) {
        oldTax = 112500 + (taxableIncomeOld - 1000000) * 0.3
      } else if (taxableIncomeOld > 500000) {
        oldTax = 12500 + (taxableIncomeOld - 500000) * 0.2
      } else if (taxableIncomeOld > 250000) {
        oldTax = (taxableIncomeOld - 250000) * 0.05
      }

      // Add 4% cess
      oldTax = oldTax * 1.04

      // New Regime Tax Calculation (simplified)
      const taxableIncomeNew = income
      let newTax = 0

      if (taxableIncomeNew > 1500000) {
        newTax = 187500 + (taxableIncomeNew - 1500000) * 0.3
      } else if (taxableIncomeNew > 1250000) {
        newTax = 125000 + (taxableIncomeNew - 1250000) * 0.25
      } else if (taxableIncomeNew > 1000000) {
        newTax = 75000 + (taxableIncomeNew - 1000000) * 0.2
      } else if (taxableIncomeNew > 750000) {
        newTax = 37500 + (taxableIncomeNew - 750000) * 0.15
      } else if (taxableIncomeNew > 500000) {
        newTax = 12500 + (taxableIncomeNew - 500000) * 0.1
      } else if (taxableIncomeNew > 300000) {
        newTax = (taxableIncomeNew - 300000) * 0.05
      }

      // Add 4% cess
      newTax = newTax * 1.04

      setOldRegimeTax(Math.round(oldTax))
      setNewRegimeTax(Math.round(newTax))
      setIsCalculating(false)
    }, 800)
  }

  return (
    <Card className="border-0 shadow-none overflow-hidden bg-gradient-to-br from-purple-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm">
      <CardContent className="p-5 space-y-5">
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-purple-50/50 dark:bg-gray-800/50 p-1 rounded-lg">
            <TabsTrigger
              value="input"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 rounded-md transition-all duration-300"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Input
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 rounded-md transition-all duration-300"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="mt-4 space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="income" className="text-purple-800 dark:text-purple-300 font-medium">
                  Annual Income (₹)
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <IndianRupee className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Input
                    id="income"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="pl-10 bg-white/70 dark:bg-gray-800/70 border-purple-200 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section80C" className="text-purple-800 dark:text-purple-300 font-medium">
                  Section 80C Investments (₹)
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <IndianRupee className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Input
                    id="section80C"
                    type="number"
                    value={section80C}
                    onChange={(e) => setSection80C(Number(e.target.value))}
                    className="pl-10 bg-white/70 dark:bg-gray-800/70 border-purple-200 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Max: ₹1,50,000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="section80D" className="text-purple-800 dark:text-purple-300 font-medium">
                  Health Insurance Premium (₹)
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <IndianRupee className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Input
                    id="section80D"
                    type="number"
                    value={section80D}
                    onChange={(e) => setSection80D(Number(e.target.value))}
                    className="pl-10 bg-white/70 dark:bg-gray-800/70 border-purple-200 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Max: ₹50,000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="housingLoan" className="text-purple-800 dark:text-purple-300 font-medium">
                  Housing Loan Interest (₹)
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <IndianRupee className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Input
                    id="housingLoan"
                    type="number"
                    value={housingLoan}
                    onChange={(e) => setHousingLoan(Number(e.target.value))}
                    className="pl-10 bg-white/70 dark:bg-gray-800/70 border-purple-200 dark:border-purple-800/50 focus:border-purple-400 dark:focus:border-purple-600 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-2">Max: ₹2,00,000</p>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={calculateTax}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg h-11 font-medium shadow-md hover:shadow-lg transition-all duration-300"
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
                      Calculate Tax <Calculator className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <AnimatePresence>
              {oldRegimeTax !== null && newRegimeTax !== null ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="p-4 bg-gradient-to-r from-purple-100/80 to-purple-50/80 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-sm"
                  >
                    <h3 className="font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
                      <span className="p-1 bg-purple-200 dark:bg-purple-800 rounded-full">
                        <IndianRupee className="w-3 h-3 text-purple-700 dark:text-purple-300" />
                      </span>
                      Old Tax Regime
                    </h3>
                    <div className="mt-2 flex items-center">
                      <IndianRupee className="w-5 h-5 mr-1 text-purple-700 dark:text-purple-300" />
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 dark:from-purple-300 dark:to-purple-500 bg-clip-text text-transparent">
                        {formatIndianNumber(oldRegimeTax)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <span>Taxable Income:</span>
                      <span className="font-medium text-purple-700 dark:text-purple-300">
                        ₹
                        {formatIndianNumber(
                          income -
                            Math.min(section80C, 150000) -
                            Math.min(section80D, 50000) -
                            Math.min(housingLoan, 200000),
                        )}
                      </span>
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="p-4 bg-gradient-to-r from-indigo-100/80 to-indigo-50/80 dark:from-indigo-900/30 dark:to-indigo-800/30 backdrop-blur-sm rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm"
                  >
                    <h3 className="font-medium text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                      <span className="p-1 bg-indigo-200 dark:bg-indigo-800 rounded-full">
                        <IndianRupee className="w-3 h-3 text-indigo-700 dark:text-indigo-300" />
                      </span>
                      New Tax Regime
                    </h3>
                    <div className="mt-2 flex items-center">
                      <IndianRupee className="w-5 h-5 mr-1 text-indigo-700 dark:text-indigo-300" />
                      <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 dark:from-indigo-300 dark:to-indigo-500 bg-clip-text text-transparent">
                        {formatIndianNumber(newRegimeTax)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                      <span>Taxable Income:</span>
                      <span className="font-medium text-indigo-700 dark:text-indigo-300">
                        ₹{formatIndianNumber(income)}
                      </span>
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="p-4 bg-gradient-to-r from-teal-100/80 to-teal-50/80 dark:from-teal-900/30 dark:to-teal-800/30 backdrop-blur-sm rounded-xl border border-teal-200/50 dark:border-teal-800/50 shadow-sm"
                  >
                    <h3 className="font-medium text-teal-800 dark:text-teal-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Recommendation
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {oldRegimeTax < newRegimeTax ? (
                        <span>
                          The <span className="font-medium text-purple-700 dark:text-purple-300">Old Tax Regime</span>{" "}
                          is better for you. You save{" "}
                          <span className="font-medium text-teal-600 dark:text-teal-400">
                            ₹{formatIndianNumber(newRegimeTax - oldRegimeTax)}
                          </span>
                        </span>
                      ) : (
                        <span>
                          The <span className="font-medium text-indigo-700 dark:text-indigo-300">New Tax Regime</span>{" "}
                          is better for you. You save{" "}
                          <span className="font-medium text-teal-600 dark:text-teal-400">
                            ₹{formatIndianNumber(oldRegimeTax - newRegimeTax)}
                          </span>
                        </span>
                      )}
                    </p>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                      <p>This is a simplified calculation. Consult a tax professional for detailed advice.</p>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-60 text-gray-500 dark:text-gray-400"
                >
                  <Calculator className="w-12 h-12 text-purple-300 dark:text-purple-700 mb-3 opacity-50" />
                  <p className="mb-3">Calculate your tax to see results</p>
                  <Button
                    onClick={() => calculateTax()}
                    variant="outline"
                    className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  >
                    Calculate Now
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

