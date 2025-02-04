"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "../../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { FcGoogle } from "react-icons/fc"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isLogin) {
        await signIn(email, password)
        router.push("/blog")
      } else {
        const userCredential = await signUp(email, password)
        if (userCredential.user) {
          await setDoc(doc(db, "users", userCredential.user.uid), {
            email: userCredential.user.email,
            lastUsernameChange: null,
            usernameChangeCount: 0,
            favorites: [],
          })
          router.push("/setup/username")
        }
      }
    } catch (error) {
      console.error(error)
      setError("Authentication failed. Please check your credentials and try again.")
      toast({
        title: "Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      if (result.user) {
        await setDoc(
          doc(db, "users", result.user.uid),
          {
            email: result.user.email,
            username: result.user.displayName || result.user.email?.split("@")[0] || "User",
            lastUsernameChange: null,
            usernameChangeCount: 0,
            favorites: [],
          },
          { merge: true },
        )
        router.push("/blog")
      }
    } catch (error) {
      console.error(error)
      setError("Google Sign-In failed. Please try again.")
      toast({
        title: "Error",
        description: "Google Sign-In failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access your account" : "Enter your details to create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn}>
              <FcGoogle className="mr-2 h-4 w-4" />
              Google
            </Button>

            <div className="text-center text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

