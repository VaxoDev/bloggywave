"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, Timestamp, getDoc, doc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuthContext } from "../../components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { SuccessPopup } from "../../components/SuccessPopup"
import { supabase } from "../../lib/supabase"
import Image from "next/image"
import { X, Upload } from "lucide-react"

const MAX_IMAGES = 5
const ADMIN_UID = "KeupJB92W7On78VJlEMg6GMsgVC3"
const MAX_TITLE_LENGTH = 50
const MAX_DESCRIPTION_LENGTH = 170

export default function CreatePost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [showPostSuccess, setShowPostSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuthContext()

  const isAdmin = user?.uid === ADMIN_UID

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value)
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setShortDescription(value)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      if (!isAdmin && images.length >= MAX_IMAGES) break

      const file = files[i]
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}_${i}.${fileExt}`

      try {
        const { data, error } = await supabase.storage.from("blog_images").upload(fileName, file)

        if (error) throw error

        const {
          data: { publicUrl },
        } = supabase.storage.from("blog_images").getPublicUrl(fileName)

        setImages((prev) => [...prev, publicUrl])
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
    }

    setUploading(false)
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

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
      const userDoc = await getDoc(doc(db, "users", user.uid))
      const username = userDoc.exists() ? userDoc.data().username : "Anonymous"
      await addDoc(collection(db, "posts"), {
        title,
        content,
        shortDescription,
        author: user.uid,
        authorName: username,
        likes: 0,
        views: 0,
        comments: [],
        createdAt: Timestamp.now(),
        images,
      })
      setShowPostSuccess(true)
      setTimeout(() => {
        setShowPostSuccess(false)
        router.push("/blog")
      }, 3000)
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
    <>
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
                <div className="relative">
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter post title"
                    required
                    maxLength={MAX_TITLE_LENGTH}
                  />
                  <span className="absolute right-2 bottom-2 text-xs text-gray-500">
                    {title.length}/{MAX_TITLE_LENGTH}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="shortDescription" className="text-sm font-medium">
                  Short Description
                </label>
                <div className="relative">
                  <Textarea
                    id="shortDescription"
                    value={shortDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Enter a short description"
                    rows={3}
                    required
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <span className="absolute right-2 bottom-2 text-xs text-gray-500">
                    {shortDescription.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
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
              <div className="space-y-2">
                <label htmlFor="images" className="text-sm font-medium">
                  Upload Images {!isAdmin && `(${images.length}/${MAX_IMAGES})`}
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading || (!isAdmin && images.length >= MAX_IMAGES)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById("images")?.click()}
                    disabled={uploading || (!isAdmin && images.length >= MAX_IMAGES)}
                  >
                    {uploading ? "Uploading..." : "Upload Images"}
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Uploaded image ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover rounded-md cursor-pointer"
                      onClick={() => setExpandedImage(image)}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
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
      <SuccessPopup message="Post created successfully" isVisible={showPostSuccess} />
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={expandedImage || "/placeholder.svg"}
                alt="Expanded image"
                width={800}
                height={600}
                className="object-contain max-h-[80vh] rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

