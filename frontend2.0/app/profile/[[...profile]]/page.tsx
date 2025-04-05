"use client";

import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function ProfilePage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your account settings and preferences</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <UserProfile 
            path="/profile"
            routing="path"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
                navbar: "bg-gray-50 dark:bg-gray-900",
                navbarButton: "text-blue-600",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}