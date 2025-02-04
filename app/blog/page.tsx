"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, limit, getDocs, doc, getDoc, type Timestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuthContext } from "../../components/AuthProvider"
import BlogCard from "../../components/BlogCard"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Loader2, Search, X, PlusCircle } from "lucide-react"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "../../hooks/use-debounce"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  shortDescription: string
  authorName: string
  author: string
  authorProfilePicture?: string | null
  likes: number
  views: number
  comments: any[]
  createdAt: Date | Timestamp
}

const WritingAnimation = ({ text }: { text: string }) => {
  const controls = useAnimation()

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      transition: { delay: i * 0.1 },
    }))
  }, [controls])

  return (
    <span className="inline-block">
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          custom={i}
          animate={controls}
          initial={{ opacity: 0 }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [username, setUsername] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const { user } = useAuthContext()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const fetchPosts = async () => {
      const welcomed = sessionStorage.getItem("welcomed")

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || "User")
        }
      }

      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50))
      const querySnapshot = await getDocs(q)

      // Fetch posts with author information including profile pictures
      const postsWithAuthors = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const postData = docSnapshot.data()
          const postId = docSnapshot.id
          let authorUsername = "Unknown Author"
          let authorProfilePicture = null

          if (postData.author) {
            try {
              const authorDoc = await getDoc(doc(db, "users", postData.author))
              if (authorDoc.exists()) {
                const authorData = authorDoc.data()
                authorUsername = authorData.username || "Unknown Author"
                authorProfilePicture = authorData.profilePicture || null
              }
            } catch (error) {
              console.error("Error fetching author data:", error)
            }
          }

          return {
            id: postId,
            ...postData,
            authorName: authorUsername,
            authorProfilePicture: authorProfilePicture,
          } as BlogPost
        }),
      )

      setPosts(postsWithAuthors)
      setFilteredPosts(postsWithAuthors)
      setLoading(false)

      setTimeout(() => {
        if (!welcomed) {
          setShowWelcome(true)
          sessionStorage.setItem("welcomed", "true")
          setTimeout(() => {
            setShowWelcome(false)
          }, 3000)
        }
      }, 1500)
    }

    fetchPosts()
  }, [user])

  useEffect(() => {
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        post.shortDescription.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    )
    setFilteredPosts(filtered)
  }, [debouncedSearchQuery, posts])

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (!isSearchExpanded) {
      setTimeout(() => {
        document.getElementById("search-input")?.focus()
      }, 300)
    } else {
      setSearchQuery("")
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
            >
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-primary fancy-font"
              >
                <WritingAnimation text={`Welcome, ${username}!`} />
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold">Latest Blog Posts</h1>
            <div className="flex items-center w-full sm:w-auto">
              <AnimatePresence>
                {isSearchExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mr-2 flex-grow"
                  >
                    <Input
                      id="search-input"
                      type="text"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex shrink-0">
                <Button
                  variant={isSearchExpanded ? "secondary" : "default"}
                  size="icon"
                  onClick={toggleSearch}
                  className="mr-2"
                >
                  {isSearchExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>
                <Link href="/create-post">
                  <Button className="flex items-center space-x-2">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">New Post</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading your personalized experience...</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredPosts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12"
                  >
                    <p className="text-lg text-muted-foreground">
                      {searchQuery
                        ? "No posts found matching your search criteria"
                        : "No blog posts available yet. Be the first to create one!"}
                    </p>
                  </motion.div>
                ) : (
                  filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BlogCard post={post} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}

