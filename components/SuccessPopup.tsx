import { motion } from "framer-motion"
import type React from "react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface SuccessPopupProps {
  message: string
  isVisible: boolean
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, isVisible }) => {
  const { theme } = useTheme()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!show) return null

  const backgroundColor = "bg-black"
  const textColor = "text-white"

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShow(false)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`${backgroundColor} rounded-lg p-6 flex flex-col items-center relative`}
      >
        <div className="w-16 h-16 relative mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Green circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="4 4" />
            {/* Green checkmark */}
            <motion.path
              d="M25,50 L45,70 L75,30"
              fill="none"
              stroke="#22c55e"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </svg>
        </div>
        <p className={`text-lg font-semibold ${textColor}`}>{message}</p>
      </motion.div>
    </div>
  )
}

