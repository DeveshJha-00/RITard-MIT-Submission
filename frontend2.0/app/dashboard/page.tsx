"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, PieChart, LineChart, Wallet, CreditCard, ArrowUpRight, Users, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
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
                Welcome, {user?.firstName || 'User'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's an overview of your financial health
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
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
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹2,56,890</div>
                <div className="flex items-center mt-1 text-sm">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight size={14} className="mr-1" /> 8.2%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
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
                <div className="text-2xl font-bold">₹42,500</div>
                <div className="flex items-center mt-1 text-sm">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpRight size={14} className="mr-1" /> 12.5%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
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
                  <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Your income and expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                  <LineChart className="h-10 w-10 text-gray-400" />
                  <span className="ml-2 text-gray-500">Chart visualization will appear here</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Where your money goes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                  <PieChart className="h-10 w-10 text-gray-400" />
                  <span className="ml-2 text-gray-500">Chart visualization will appear here</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}