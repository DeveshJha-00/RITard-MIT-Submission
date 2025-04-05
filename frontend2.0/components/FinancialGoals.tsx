"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PlusCircle, Trash2, IndianRupee, Target, Calendar, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
}

export function FinancialGoals() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      name: "Emergency Fund",
      targetAmount: 300000,
      currentAmount: 150000,
      targetDate: "2023-12-31",
    },
    {
      id: "2",
      name: "Down Payment for Home",
      targetAmount: 1500000,
      currentAmount: 500000,
      targetDate: "2025-06-30",
    },
  ])

  const [newGoal, setNewGoal] = useState<Omit<Goal, "id">>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    targetDate: new Date().toISOString().split("T")[0],
  })

  const [showAddForm, setShowAddForm] = useState(false)

  // Format number with commas for Indian numbering system
  const formatIndianNumber = (num: number) => {
    return num.toLocaleString("en-IN")
  }

  const addGoal = () => {
    if (!newGoal.name || newGoal.targetAmount <= 0) return

    setGoals([...goals, { ...newGoal, id: Date.now().toString() }])
    setNewGoal({
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: new Date().toISOString().split("T")[0],
    })
    setShowAddForm(false)
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100)
  }

  const calculateTimeLeft = (targetDate: string) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Overdue"
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 30) return `${diffDays} days left`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months left`
    return `${Math.floor(diffDays / 365)} years left`
  }

  const getTimeLeftColor = (targetDate: string) => {
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30"
    if (diffDays < 30) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30"
    return "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
  }

  return (
    <Card className="border-0 shadow-none overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-sm w-full">
      <CardContent className="p-4 lg:p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Your Financial Goals
          </h3>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="h-8 px-3 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              Add Goal
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-indigo-100/80 to-indigo-50/80 dark:from-indigo-900/30 dark:to-indigo-800/30 backdrop-blur-sm rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm space-y-3">
                <div>
                  <Label htmlFor="goalName" className="text-indigo-800 dark:text-indigo-300 font-medium">
                    Goal Name
                  </Label>
                  <Input
                    id="goalName"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    placeholder="e.g., Buy a Car"
                    className="mt-1 bg-white/70 dark:bg-gray-800/70 border-indigo-200 dark:border-indigo-800/50 focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-indigo-400 dark:focus:ring-indigo-600 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="targetAmount" className="text-indigo-800 dark:text-indigo-300 font-medium">
                      Target Amount (₹)
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <IndianRupee className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <Input
                        id="targetAmount"
                        type="number"
                        value={newGoal.targetAmount || ""}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                        className="mt-1 pl-10 bg-white/70 dark:bg-gray-800/70 border-indigo-200 dark:border-indigo-800/50 focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-indigo-400 dark:focus:ring-indigo-600 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentAmount" className="text-indigo-800 dark:text-indigo-300 font-medium">
                      Current Savings (₹)
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <IndianRupee className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <Input
                        id="currentAmount"
                        type="number"
                        value={newGoal.currentAmount || ""}
                        onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                        className="mt-1 pl-10 bg-white/70 dark:bg-gray-800/70 border-indigo-200 dark:border-indigo-800/50 focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-indigo-400 dark:focus:ring-indigo-600 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="targetDate"
                    className="text-indigo-800 dark:text-indigo-300 font-medium flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Target Date
                  </Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="mt-1 bg-white/70 dark:bg-gray-800/70 border-indigo-200 dark:border-indigo-800/50 focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-indigo-400 dark:focus:ring-indigo-600 rounded-lg"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddForm(false)}
                      className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={addGoal}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Add Goal
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          <AnimatePresence>
            {goals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-10 text-gray-500 dark:text-gray-400"
              >
                <Target className="w-16 h-16 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No financial goals yet</p>
                <p className="text-sm mt-1">Add your first goal to start tracking</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4 inline-block">
                  <Button
                    onClick={() => setShowAddForm(true)}
                    variant="outline"
                    className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Your First Goal
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="p-4 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-indigo-800 dark:text-indigo-300">{goal.name}</h4>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <IndianRupee className="w-3 h-3 mr-1 text-indigo-600 dark:text-indigo-400" />
                        <span>{formatIndianNumber(goal.currentAmount)}</span>
                        <span className="mx-1">of</span>
                        <IndianRupee className="w-3 h-3 mr-1 text-indigo-600 dark:text-indigo-400" />
                        <span>{formatIndianNumber(goal.targetAmount)}</span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoal(goal.id)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>

                  <div className="mt-3 relative">
                    <Progress
                      value={calculateProgress(goal.currentAmount, goal.targetAmount)}
                      className="h-2 bg-indigo-100 dark:bg-indigo-900/30"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(goal.currentAmount, goal.targetAmount)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="absolute top-0 left-0 h-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                    />
                  </div>

                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                      {calculateProgress(goal.currentAmount, goal.targetAmount)}% complete
                    </span>
                    <span className={`px-2 py-1 rounded-full font-medium ${getTimeLeftColor(goal.targetDate)}`}>
                      {calculateTimeLeft(goal.targetDate)}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

