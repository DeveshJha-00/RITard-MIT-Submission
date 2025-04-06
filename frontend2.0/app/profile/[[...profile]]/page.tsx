"use client";

import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function ProfilePage() {
  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950/30">
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
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <UserProfile 
            path="/profile"
            routing="path"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
                navbar: "bg-gray-50 dark:bg-gray-900",
                navbarButton: "text-blue-600 dark:text-blue-400",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                formFieldLabel: "text-gray-700 dark:text-gray-300",
                formFieldInput: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400",
                formFieldAction: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
                formFieldSuccessText: "text-green-600 dark:text-green-400",
                formFieldErrorText: "text-red-600 dark:text-red-400",
                headerTitle: "text-gray-900 dark:text-white",
                headerSubtitle: "text-gray-600 dark:text-gray-300",
                profileSectionTitle: "text-gray-900 dark:text-white",
                profileSectionPrimaryButton: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
                accordionTriggerButton: "text-gray-700 dark:text-gray-300",
              },
              variables: {
                colorBackground: "white",
                colorInputBackground: "white",
                colorInputText: "var(--input-color)",
                colorText: "var(--input-color)",
                colorPrimary: "#2563eb",
                borderRadius: "0.5rem",
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}