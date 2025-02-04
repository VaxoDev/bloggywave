"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, deleteDoc, doc, where, type Timestamp } from "firebase/firestore"
import { db } from "../lib/firebase"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Eye, Heart, Trash2, MessageCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { ConfirmationDialog } from "./ConfirmationDialog"
import { TopPostsPodium } from "./TopPostsPodium"
import { Switch } from "@/components/ui/switch"
import { useAuthContext } from "./AuthProvider"
import UserSettings from "./UserSettings"

interface BlogPost {
  id: string
  title: string
  author: string
  authorName: string
  likes: number
  views: number
  comments: any[]
  createdAt: Date
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [totalComments, setTotalComments] = useState(0)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [showPersonalStats, setShowPersonalStats] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user } = useAuthContext()

  useEffect(() => {
    fetchPosts()
  }, [user])

  const fetchPosts = async () => {
    if (!user) return
    let q
    if (showPersonalStats) {
      q = query(collection(db, "posts"), where("author", "==", user.uid))
    } else {
      q = query(collection(db, "posts"))
    }
    const querySnapshot = await getDocs(q)
    const fetchedPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
    })) as BlogPost[]
    setPosts(fetchedPosts)

    const likes = fetchedPosts.reduce((sum, post) => sum + post.likes, 0)
    const views = fetchedPosts.reduce((sum, post) => sum + post.views, 0)
    const comments = fetchedPosts.reduce((sum, post) => sum + post.comments.length, 0)
    setTotalLikes(likes)
    setTotalViews(views)
    setTotalComments(comments)
  }

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePost = async () => {
    if (postToDelete) {
      await deleteDoc(doc(db, "posts", postToDelete))
      fetchPosts()
      setIsDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const chartData = posts
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((post) => ({
      date: post.createdAt.toLocaleDateString(),
      likes: post.likes,
      views: post.views,
      comments: post.comments.length,
    }))

  const pieChartData = [
    { name: "Likes", value: totalLikes },
    { name: "Views", value: totalViews },
    { name: "Comments", value: totalComments },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  const postsByTimeData = posts.reduce(
    (acc, post) => {
      const hour = post.createdAt.getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  const postsByTimeChartData = Object.entries(postsByTimeData).map(([hour, count]) => ({
    hour: Number.parseInt(hour),
    count,
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">{showPersonalStats ? "Your" : "Global"} Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span>Show personal stats</span>
          <Switch checked={showPersonalStats} onCheckedChange={setShowPersonalStats} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#8884d8" />
                <Line type="monotone" dataKey="views" stroke="#82ca9d" />
                <Line type="monotone" dataKey="comments" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Posts by Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={postsByTimeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length > 0 && (
            <TopPostsPodium
              mostLiked={posts.reduce((prev, current) => (prev.likes > current.likes ? prev : current))}
              mostViewed={posts.reduce((prev, current) => (prev.views > current.views ? prev : current))}
              mostCommented={posts.reduce((prev, current) =>
                prev.comments.length > current.comments.length ? prev : current,
              )}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Posts</CardTitle>
          <Link href="/create-post">
            <Button>New Post</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.authorName}</TableCell>
                  <TableCell>{post.likes}</TableCell>
                  <TableCell>{post.views}</TableCell>
                  <TableCell>{post.comments.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link href={`/blog/${post.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={toggleTheme}>Switch to {theme === "light" ? "Dark" : "Light"} Theme</Button>
        </CardContent>
      </Card>
      <Card>
        <UserSettings />
      </Card>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeletePost}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}

