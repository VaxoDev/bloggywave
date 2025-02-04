"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface UsernameSelectionProps {
  userId: string
  onComplete: (username: string) => void
}

export function UsernameSelection({ userId, onComplete }: UsernameSelectionProps) {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.length > 25) {
      setError("Username must be 25 characters or less")
      return
    }

    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists() && userSnap.data().username === username) {
      setError("This username is already taken")
      return
    }

    await setDoc(userRef, { username }, { merge: true })
    onComplete(username)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold text-center">What should we call you?</h2>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          maxLength={25}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full">
          Set Username
        </Button>
      </form>
    </motion.div>
  )
}

