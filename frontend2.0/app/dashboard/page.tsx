"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  PieChart,
  LineChart,
  Wallet,
  CreditCard,
  ArrowUpRight,
  Users,
  Bell,
  Calendar,
  Brain,
  TrendingUp,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";
import {
  processTransactions,
  Transaction,
  CategoryData,
  getCategoryFromTransaction,
} from "../utils/transactionUtils";
import transactionsData from "../data/transactions.json";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

// Process the transaction data
const { monthlySpending, expenseCategories, dailySpending, transactions } =
  processTransactions(transactionsData.data as Transaction[]);

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Get unique categories from transactions
  const categories = Array.from(
    new Set(transactions.map((t) => getCategoryFromTransaction(t)))
  );

  // Filter transactions based on search query and category
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.remittanceInformationUnstructured
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.bankTransactionCode
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.amount.toString().includes(searchQuery);

    const matchesCategory =
      !selectedCategory ||
      getCategoryFromTransaction(transaction) === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate total balance (net earnings vs spending)
  const totalIncome = transactions
    .filter((t: Transaction) => t.amount > 0)
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
  const totalExpenses = Math.abs(
    transactions
      .filter((t: Transaction) => t.amount < 0)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  );
  const totalBalance = totalIncome - totalExpenses;

  // Calculate monthly savings (current month's earnings vs spending)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = transactions
    .filter((t: Transaction) => {
      const date = new Date(t.bookingDate);
      return (
        t.amount > 0 &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const monthlyExpenses = Math.abs(
    transactions
      .filter((t: Transaction) => {
        const date = new Date(t.bookingDate);
        return (
          t.amount < 0 &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  );
  const monthlySavings = monthlyIncome - monthlyExpenses;

  // Calculate savings rate
  const savingsRate =
    monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome, {user?.firstName || "User"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's an overview of your financial health
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Bell size={16} />
                Notifications
              </Button>
              <Link href="/profile">
                <Button size="sm" className="flex items-center gap-2">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Net Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{totalBalance.toLocaleString()}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Income: ₹{totalIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Expenses: ₹{totalExpenses.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Monthly Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{monthlySavings.toLocaleString()}
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Savings Rate: {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center mt-1 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    This Month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Investment Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹1,35,750</div>
                <div className="flex items-center mt-1 text-sm">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight size={14} className="mr-1" /> 5.8%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    vs last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  Your income and expenses over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={monthlySpending}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        name="Spending"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Where your money goes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseCategories.map(
                          (entry: CategoryData, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>
                      Your latest financial activities
                    </CardDescription>
                  </div>
                  <div className="w-64">
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredTransactions.map((transaction: Transaction) => (
                  <div
                    key={transaction.externalId}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.amount < 0
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {transaction.amount < 0 ? (
                          <CreditCard className="h-5 w-5" />
                        ) : (
                          <Wallet className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.remittanceInformationUnstructured}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">
                            {format(
                              parseISO(transaction.bookingDate),
                              "MMM dd, yyyy"
                            )}
                          </p>
                          <span className="text-sm text-gray-400">•</span>
                          <p className="text-sm text-gray-500">
                            {getCategoryFromTransaction(transaction)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          transaction.amount < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ₹{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.bankTransactionCode}
                      </p>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found matching your search
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Heatmap */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Spending Calendar</CardTitle>
              <CardDescription>
                Your spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={dailySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="amount"
                      fill="#8884d8"
                      name="Daily Spending"
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Section */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <CardTitle>AI Insights</CardTitle>
              </div>
              <CardDescription>
                Personalized financial insights based on your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Spending Trend Analysis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Your food & dining expenses have increased by 15% compared
                      to last month. Consider reviewing your dining out
                      frequency to maintain your savings goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Savings Opportunity</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      You're spending 25% of your income on transportation.
                      Consider using public transport or carpooling to reduce
                      these costs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Financial Health</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Your current savings rate of {savingsRate.toFixed(1)}% is
                      good, but you could aim for 30% to build a stronger
                      financial foundation. Consider automating your savings.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
