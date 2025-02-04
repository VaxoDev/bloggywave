"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "../../../components/AuthProvider"

export default function AgreementPage() {
  const [canConfirm, setCanConfirm] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const router = useRouter()
  const { user, loading } = useAuthContext()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer)
          setCanConfirm(true)
          return 0
        }
        return prevCountdown - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleConfirm = () => {
    if (canConfirm) {
      router.push("/blog")
    }
  }

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">User Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Please read and agree to the following rules:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Be respectful to other users and their opinions.</li>
              <li>Do not post any harmful, offensive, or illegal content.</li>
              <li>Respect copyright and intellectual property rights.</li>
              <li>Do not spam or advertise without permission.</li>
              <li>Protect your personal information and that of others.</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={handleConfirm} disabled={!canConfirm} className="w-full">
              {canConfirm ? "I Agree" : `Please wait ${countdown} seconds`}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

