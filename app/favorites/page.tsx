"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuthContext } from "../../components/AuthProvider"
import BlogCard from "../../components/BlogCard"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Heart, Search, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "../../hooks/use-debounce"

interface BlogPost {
  id: string
  title: string
  shortDescription: string
  authorName: string
  authorProfilePicture?: string | null
  likes: number
  views: number
  comments: any[]
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<BlogPost[]>([])
  const [filteredFavorites, setFilteredFavorites] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const { user } = useAuthContext()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const favoriteIds = userDoc.data().favorites || []
        const favoritePosts = await Promise.all(
          favoriteIds.map(async (id: string) => {
            const postDoc = await getDoc(doc(db, "posts", id))
            if (postDoc.exists()) {
              const postData = postDoc.data()
              const authorDoc = await getDoc(doc(db, "users", postData.author))
              const authorData = authorDoc.exists() ? authorDoc.data() : null
              return {
                id,
                ...postData,
                authorProfilePicture: authorData?.profilePicture || null,
              } as BlogPost
            }
            return null
          }),
        )
        const validFavorites = favoritePosts.filter((post): post is BlogPost => post !== null)
        setFavorites(validFavorites)
        setFilteredFavorites(validFavorites)
      }
      setLoading(false)
    }

    fetchFavorites()
  }, [user])

  useEffect(() => {
    const filtered = favorites.filter(
      (post) =>
        post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        post.shortDescription.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    )
    setFilteredFavorites(filtered)
  }, [debouncedSearchQuery, favorites])

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (!isSearchExpanded) {
      setTimeout(() => {
        document.getElementById("search-input")?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }

  if (!user) return null

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Your Favorites <Heart className="h-6 w-6 text-red-500" />
          </h1>
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "clamp(200px, 65vw, 300px)", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mr-2"
                >
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant={isSearchExpanded ? "secondary" : "default"}
              size="icon"
              onClick={toggleSearch}
              className="relative"
            >
              {isSearchExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading your favorite posts...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? "No favorites found matching your search criteria"
                  : "When you find posts you love, click the heart icon to add them to your favorites and easily find them here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredFavorites.map((post) => (
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
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  )
}

