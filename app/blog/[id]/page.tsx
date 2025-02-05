"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  increment,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { useAuthContext } from "../../../components/AuthProvider"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  MessageCircle,
  Eye,
  ThumbsUp,
  Send,
  Trash2,
  Share2,
  Link2,
  Mail,
  Twitter,
  Facebook,
  Check,
  Copy,
  Clock,
  Pencil,
  X,
  Upload,
} from "lucide-react"
import { format } from "date-fns"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "../../../lib/supabase"
import { toast } from "@/components/ui/use-toast"

const adminUID = "KeupJB92W7On78VJlEMg6GMsgVC3"

interface BlogPost {
  id: string
  title: string
  shortDescription?: string
  content: string
  authorName: string
  author: string
  authorProfilePicture?: string | null
  likes: number
  views: number
  comments: Comment[]
  likedBy: string[]
  viewedBy?: string[]
  images?: string[]
  createdAt: Timestamp
}

interface Comment {
  id: string
  author: string
  username: string
  content: string
  createdAt: Timestamp
  likes: number
  likedBy: string[]
}

export default function BlogPost() {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comment, setComment] = useState("")
  const [userLiked, setUserLiked] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showCopyLinkDialog, setShowCopyLinkDialog] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const { id } = useParams()
  const { user } = useAuthContext()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedTitle, setEditedTitle] = useState(post?.title || "")
  const [editedShortDescription, setEditedShortDescription] = useState(post?.shortDescription || "")
  const [editedContent, setEditedContent] = useState(post?.content || "")
  const [editedImages, setEditedImages] = useState<string[]>(post?.images || [])

  const nextImage = () => {
    if (post?.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  useEffect(() => {
    const fetchPost = async () => {
      if (!user) return
      const docRef = doc(db, "posts", id as string)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const authorRef = doc(db, "users", docSnap.data().author)
        const authorDoc = await getDoc(authorRef)
        const authorData = authorDoc.exists() ? authorDoc.data() : null

        const postData = {
          id: docSnap.id,
          ...docSnap.data(),
          authorProfilePicture: authorData?.profilePicture || null,
          likedBy: docSnap.data().likedBy || [],
        } as BlogPost

        setPost(postData)
        setUserLiked(postData.likedBy.includes(user.uid))
        setEditedTitle(postData.title)
        setEditedShortDescription(postData.shortDescription || "")
        setEditedContent(postData.content)
        setEditedImages(postData.images || [])

        if (!postData.viewedBy?.includes(user.uid)) {
          await updateDoc(docRef, {
            views: increment(1),
            viewedBy: arrayUnion(user.uid),
          })
        }
      }
    }

    fetchPost()
  }, [id, user])

  const handleLike = async () => {
    if (!post || !user) return
    const docRef = doc(db, "posts", post.id)
    const userRef = doc(db, "users", user.uid)
    if (userLiked) {
      await updateDoc(docRef, {
        likes: increment(-1),
        likedBy: arrayRemove(user.uid),
      })
      await updateDoc(userRef, {
        favorites: arrayRemove(post.id),
      })
      setUserLiked(false)
      setPost({
        ...post,
        likes: post.likes - 1,
        likedBy: Array.isArray(post.likedBy) ? post.likedBy.filter((uid) => uid !== user.uid) : [],
      })
    } else {
      await updateDoc(docRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid),
      })
      await updateDoc(userRef, {
        favorites: arrayUnion(post.id),
      })
      setUserLiked(true)
      setPost({
        ...post,
        likes: post.likes + 1,
        likedBy: Array.isArray(post.likedBy) ? [...post.likedBy, user.uid] : [user.uid],
      })
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !user || !comment.trim()) return

    const userDoc = await getDoc(doc(db, "users", user.uid))
    const username = userDoc.exists() ? userDoc.data().username : "Unknown"

    const docRef = doc(db, "posts", post.id)
    const newComment = {
      id: Date.now().toString(),
      author: user.uid,
      username: username,
      content: comment,
      createdAt: Timestamp.now(),
      likes: 0,
      likedBy: [],
    }
    await updateDoc(docRef, {
      comments: arrayUnion(newComment),
    })
    setPost({ ...post, comments: [...post.comments, newComment] })
    setComment("")
  }

  const handleCommentLike = async (commentId: string) => {
    if (!post || !user) return
    const docRef = doc(db, "posts", post.id)
    const updatedComments = post.comments.map((c) =>
      c.id === commentId
        ? c.likedBy.includes(user.uid)
          ? { ...c, likes: c.likes - 1, likedBy: c.likedBy.filter((uid) => uid !== user.uid) }
          : { ...c, likes: c.likes + 1, likedBy: [...c.likedBy, user.uid] }
        : c,
    )
    await updateDoc(docRef, { comments: updatedComments })
    setPost({ ...post, comments: updatedComments })
  }

  const handleDeleteComment = (commentId: string) => {
    setDeleteCommentId(commentId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteComment = async () => {
    if (!post || !user || !deleteCommentId) return
    const docRef = doc(db, "posts", post.id)
    const updatedComments = post.comments.filter((c) => c.id !== deleteCommentId)
    await updateDoc(docRef, { comments: updatedComments })
    setPost({ ...post, comments: updatedComments })
    setIsDeleteDialogOpen(false)
    setDeleteCommentId(null)
  }

  const handleCopyLink = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setShowCopySuccess(true)
    setTimeout(() => {
      setShowCopySuccess(false)
      setShowCopyLinkDialog(false)
    }, 2000)
  }

  const handleShare = async (platform: string) => {
    if (!post) return
    const url = window.location.href
    const text = `Check out this post: ${post.title}`

    switch (platform) {
      case "native":
        if (typeof navigator !== "undefined" && navigator.share) {
          try {
            await navigator.share({
              title: post.title,
              text: text,
              url: url,
            })
          } catch (err) {
            console.error("Error sharing:", err)
          }
        }
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        )
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(
          `${text}\n\n${url}`,
        )}`
        break
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!user || (editedImages.length >= 5 && user.uid !== adminUID)) {
      toast({
        title: "Error",
        description: "You can't upload more than 5 images.",
        variant: "destructive",
      })
      return
    }

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from("blog_images").upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog_images").getPublicUrl(fileName)
      setEditedImages([...editedImages, publicUrl])
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setEditedImages(editedImages.filter((_, i) => i !== index))
  }

  const handleUpdate = async () => {
    if (!post || !user) return
    const docRef = doc(db, "posts", post.id)

    // Remove old images that are not in editedImages
    const imagesToRemove = post.images?.filter((img) => !editedImages.includes(img)) || []
    for (const imageUrl of imagesToRemove) {
      const fileName = imageUrl.split("/").pop()
      if (fileName) {
        await supabase.storage.from("blog_images").remove([fileName])
      }
    }

    await updateDoc(docRef, {
      title: editedTitle,
      shortDescription: editedShortDescription,
      content: editedContent,
      images: editedImages,
    })
    setPost({
      ...post,
      title: editedTitle,
      shortDescription: editedShortDescription,
      content: editedContent,
      images: editedImages,
    })
    setIsEditMode(false)
    toast({
      title: "Success",
      description: "Post updated successfully",
    })
  }

  const handleDeletePost = async () => {
    if (!post || !user) return

    // Check if the user has permission to delete the post
    if (user.uid !== post.author && user.uid !== adminUID) {
      toast({
        title: "Error",
        description: "You don't have permission to delete this post.",
        variant: "destructive",
      })
      return
    }

    try {
      // Delete images from Supabase storage
      if (post.images && post.images.length > 0) {
        for (const imageUrl of post.images) {
          const fileName = imageUrl.split("/").pop()
          if (fileName) {
            const { error } = await supabase.storage.from("blog_images").remove([fileName])
            if (error) throw error
          }
        }
      }

      // Delete the post document from Firestore
      await deleteDoc(doc(db, "posts", post.id))

      // Delete all comments associated with this post
      const commentsQuery = query(collection(db, "comments"), where("postId", "==", post.id))
      const commentsSnapshot = await getDocs(commentsQuery)
      const deleteCommentPromises = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deleteCommentPromises)

      // Remove the post from users' favorites
      const usersQuery = query(collection(db, "users"), where("favorites", "array-contains", post.id))
      const usersSnapshot = await getDocs(usersQuery)
      const updateUserPromises = usersSnapshot.docs.map((doc) =>
        updateDoc(doc.ref, {
          favorites: arrayRemove(post.id),
        }),
      )
      await Promise.all(updateUserPromises)

      toast({
        title: "Success",
        description: "Post deleted successfully",
      })
      router.push("/blog")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!post) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (!post || !post.comments) return <div className="container mx-auto px-4 py-8">Post not found or loading...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8 overflow-hidden relative">
        <CardHeader className="bg-secondary p-6">
          <CardTitle className="text-3xl font-bold mb-2 text-foreground">{post.title}</CardTitle>
          {(user?.uid === post.author || user?.uid === adminUID) && (
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditMode(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDeletePost} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <CardDescription className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{format(post.createdAt.toDate(), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            <Link
              href={`/user/${post.author}`}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarImage src={post.authorProfilePicture || undefined} />
                <AvatarFallback>{post.authorName ? post.authorName[0].toUpperCase() : "#"}</AvatarFallback>
              </Avatar>
              <span className="text-lg text-foreground">By {post.authorName}</span>
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div
            className="prose dark:prose-invert max-w-none mb-8 text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
        <CardFooter className="bg-muted p-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center space-x-2 ${userLiked ? "text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`w-6 h-6 ${userLiked ? "fill-current" : ""}`} />
              <span>{post.likes}</span>
            </motion.button>
            <span className="flex items-center space-x-2 text-muted-foreground">
              <Eye className="w-6 h-6" />
              <span>{post.views}</span>
            </span>
            <span className="flex items-center space-x-2 text-muted-foreground">
              <MessageCircle className="w-6 h-6" />
              <span>{post.comments.length}</span>
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setShowCopyLinkDialog(true)} className="flex items-center">
                <Link2 className="mr-2 h-4 w-4" />
                <span>Copy Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("email")} className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span>Share via Email</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleShare("twitter")} className="flex items-center">
                <Twitter className="mr-2 h-4 w-4" />
                <span>Share on Twitter</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare("facebook")} className="flex items-center">
                <Facebook className="mr-2 h-4 w-4" />
                <span>Share on Facebook</span>
              </DropdownMenuItem>
              {navigator.share && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleShare("native")} className="flex items-center">
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share...</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {post.images && post.images.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="relative h-96">
            <Image
              src={post.images[currentImageIndex] || "/placeholder.svg"}
              alt={`Image ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="contain"
            />
            {post.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                  disabled={currentImageIndex === post.images.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          <div className="flex justify-center space-x-2">
            {post.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence>
            {post.comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-muted p-4 rounded-lg shadow-sm"
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.authorProfilePicture || undefined} />
                      <AvatarFallback>{comment.username ? comment.username[0].toUpperCase() : "#"}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">{comment.username}</span>
                  </div>
                  <p className="text-foreground">{comment.content}</p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{format(comment.createdAt.toDate(), "MMM d, yyyy 'at' h:mm a")}</span>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center space-x-1 ${
                          comment.likedBy.includes(user?.uid || "") ? "text-primary" : "text-muted-foreground"
                        } hover:text-primary transition-colors`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{comment.likes} likes</span>
                      </motion.button>
                      {(user?.uid === comment.author || user?.uid === adminUID) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">Add a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleComment} className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button type="submit" className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Post Comment</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCopyLinkDialog} onOpenChange={setShowCopyLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Share Link</DialogTitle>
            <DialogDescription>Copy the link below to share this post</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="bg-muted p-2 rounded-md flex-1 w-64 max-w-[300px]">
              <p className="text-sm text-muted-foreground truncate">{window.location.href}</p>
            </div>
            <Button onClick={handleCopyLink} size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showCopySuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Alert className="bg-green-500 text-white border-none">
              <Check className="h-4 w-4" />
              <AlertDescription>Link copied to clipboard!</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Post</DialogTitle>
            <DialogDescription>Make changes to your blog post here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={editedShortDescription}
                onChange={(e) => setEditedShortDescription(e.target.value)}
                className="w-full"
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full"
                rows={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="images">Images</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={editedImages.length >= 5 && user?.uid !== adminUID}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("images")?.click()}
                  disabled={editedImages.length >= 5 && user?.uid !== adminUID}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {editedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Image ${index + 1}`}
                      width={60}
                      height={60}
                      className="object-cover rounded-md w-full h-auto"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

