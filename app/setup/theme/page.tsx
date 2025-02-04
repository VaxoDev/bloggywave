"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useAuthContext } from "../../../components/AuthProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function ThemeSetup() {
  const { setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("light")
  const router = useRouter()
  const { user, loading } = useAuthContext()
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setProfilePicture(userDoc.data().profilePicture || null)
        }
      }
    }
    fetchProfilePicture()
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleThemeChange = (theme: "light" | "dark") => {
    setSelectedTheme(theme)
    setTheme(theme)
  }

  const handleConfirm = () => {
    router.push("/setup/agreement")
  }

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background"
    >
      <Avatar className="w-24 h-24 mb-4">
        <AvatarImage src={profilePicture || undefined} />
        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold mb-4">Choose your theme</h2>
      <div className="flex space-x-4 mb-4">
        <Button onClick={() => handleThemeChange("light")} variant={selectedTheme === "light" ? "default" : "outline"}>
          Light
        </Button>
        <Button onClick={() => handleThemeChange("dark")} variant={selectedTheme === "dark" ? "default" : "outline"}>
          Dark
        </Button>
      </div>
      <Button onClick={handleConfirm} className="mt-4">
        Confirm and Continue
      </Button>
    </motion.div>
  )
}

