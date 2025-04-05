"use client"

import { useEffect } from "react"

export default function RevealAnimations() {
  useEffect(() => {
    // Function to check if an element is in viewport
    const isInViewport = (element: Element) => {
      const rect = element.getBoundingClientRect()
      return rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 && rect.bottom >= 0
    }

    // Function to handle scroll and reveal elements
    const handleScroll = () => {
      const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale")
      const staggerItems = document.querySelectorAll(".stagger-item")

      // Handle standard reveal animations
      revealElements.forEach((element) => {
        if (isInViewport(element)) {
          element.classList.add("active")
        }
      })

      // Handle staggered animations
      const staggerContainers = document.querySelectorAll(".stagger-container")
      staggerContainers.forEach((container) => {
        if (isInViewport(container)) {
          const items = container.querySelectorAll(".stagger-item")
          items.forEach((item) => {
            item.classList.add("active")
          })
        }
      })
    }

    // Initial check on load
    handleScroll()

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return null
}

