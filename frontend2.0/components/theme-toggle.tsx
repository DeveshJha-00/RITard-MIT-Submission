"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch by mounting client-side only
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={cn("w-10 h-10", className)} />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "rounded-full w-10 h-10 hover:scale-110 transition-transform border border-gray-200 dark:border-gray-700",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-6 w-6 text-yellow-300" />
      ) : (
        <Moon className="h-6 w-6 text-slate-700" />
      )}
    </Button>
  )
}

export function FloatingThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch by mounting client-side only
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-full w-12 h-12 shadow-lg hover:shadow-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:scale-110 transition-all"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-6 w-6 text-yellow-400" />
        ) : (
          <Moon className="h-6 w-6 text-slate-700" />
        )}
      </Button>
    </div>
  )
}

export function GlobalThemeScript() {
  // This script ensures inputs and other elements have proper colors in dark mode
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Apply dark mode CSS variables for better readability of inputs
            function applyDarkModeStyles() {
              const htmlEl = document.documentElement;
              
              if (htmlEl.classList.contains("dark")) {
                document.documentElement.style.setProperty('--input-color', 'white');
                document.documentElement.style.setProperty('--input-placeholder-color', 'rgba(255, 255, 255, 0.6)');
              } else {
                document.documentElement.style.setProperty('--input-color', 'black');
                document.documentElement.style.setProperty('--input-placeholder-color', 'rgba(0, 0, 0, 0.5)');
              }
            }
            
            // Run immediately
            applyDarkModeStyles();
            
            // Set up observer to watch for class changes on html element
            const observer = new MutationObserver(applyDarkModeStyles);
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
          })();
        `,
      }}
    />
  )
} 