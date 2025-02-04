"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuthContext } from "../../components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

export default function AddPost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const router = useRouter()
  const { user } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      })
      return
    }
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        author: user.uid,
        authorName: user.displayName || "Anonymous",
        likes: 0,
        views: 0,
        comments: [],
        createdAt: Timestamp.now(),
      })
      toast({
        title: "Success",
        description: "Your post has been created",
      })
      router.push("/blog")
    } catch (error) {
      console.error("Error adding document: ", error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Post Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Post Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                rows={10}
                required
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
              >
                Create Post
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

