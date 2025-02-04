"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import type { User } from "firebase/auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        const result = await signUp(email, password)
        const user = result?.user as User
        if (user) {
          await setDoc(doc(db, "users", user.uid), {
            username: user.displayName || email.split("@")[0],
            lastUsernameChange: null,
            usernameChangeCount: 0,
            email: user.email,
          })
        }
      }
      onClose()
    } catch (error) {
      console.error("Authentication error:", error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      const user = result?.user as User
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            username: user.displayName || user.email?.split("@")[0] || "User",
            lastUsernameChange: null,
            usernameChangeCount: 0,
            email: user.email,
          },
          { merge: true },
        )
      }
      onClose()
    } catch (error) {
      console.error("Google Sign-In error:", error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Sign Up"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
              >
                {isLogin ? "Login" : "Sign Up"}
              </button>
            </form>
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-300 mt-4"
            >
              Sign in with Google
            </button>
            <p className="mt-4 text-center">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 hover:underline">
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

