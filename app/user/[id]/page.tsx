"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import BlogCard from "../../../components/BlogCard"
import { motion } from "framer-motion"

interface UserProfile {
  username: string
  profilePicture: string | null
  bio: string
}

interface BlogPost {
  id: string
  title: string
  shortDescription: string
  author: string
  authorName: string
  authorProfilePicture?: string | null
  likes: number
  views: number
  comments: any[]
  createdAt: Date
}

type SortOption = "recent" | "old" | "likes" | "views" | "comments"

export default function UserProfile() {
  const { id } = useParams()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userPosts, setUserPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("recent")

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userDoc = await getDoc(doc(db, "users", id as string))
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile)
      }

      const postsQuery = query(collection(db, "posts"), where("author", "==", id))
      const postsSnapshot = await getDocs(postsQuery)
      const posts = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        authorProfilePicture: userDoc.exists() ? userDoc.data().profilePicture : null,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }) as BlogPost)
      setUserPosts(posts)
      setFilteredPosts(sortPosts(posts, "recent"))
    }

    fetchUserProfile()
  }, [id])

  const sortPosts = (posts: BlogPost[], sortOption: SortOption) => {
    const sortedPosts = [...posts]
    switch (sortOption) {
      case "recent":
        return sortedPosts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      case "old":
        return sortedPosts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      case "likes":
        return sortedPosts.sort((a, b) => b.likes - a.likes)
      case "views":
        return sortedPosts.sort((a, b) => b.views - a.views)
      case "comments":
        return sortedPosts.sort((a, b) => b.comments.length - a.comments.length)
      default:
        return sortedPosts
    }
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    setFilteredPosts(sortPosts(userPosts, value))
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={userProfile.profilePicture || undefined} />
            <AvatarFallback>{userProfile.username[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl font-bold">{userProfile.username}</CardTitle>
            <p className="text-muted-foreground mt-2">{userProfile.bio || "No bio available"}</p>
          </div>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <CardTitle className="text-xl font-bold">Posts by {userProfile.username}</CardTitle>
        <div className="w-48">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="old">Oldest First</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="comments">Most Commented</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BlogCard post={post} />
          </motion.div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">
            No posts found
          </div>
        )}
      </div>
    </div>
  )
}

