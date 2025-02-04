import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Heart, MessageCircle, Clock } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { Timestamp } from 'firebase/firestore'

interface BlogPost {
  id: string;
  title: string;
  shortDescription: string;
  author: string;
  authorName: string;
  authorProfilePicture?: string | null;
  likes: number;
  views: number;
  comments: any[];
  images?: string[];
  createdAt: Date | Timestamp;  // Updated to handle both Date and Timestamp
}

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) {
    return null
  }

  // Function to safely format the date
  const formatDate = (dateValue: Date | Timestamp) => {
    try {
      // If it's a Timestamp, convert to Date
      const date = dateValue instanceof Timestamp ? dateValue.toDate() : dateValue
      return format(date, "MMM d, yyyy 'at' h:mm a")
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold break-words whitespace-normal">
            {post.title || "Untitled"}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4 mr-1" />
            {formatDate(post.createdAt)}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          {post.images && post.images.length > 0 && (
            <div className="relative h-48 mb-4">
              <Image
                src={post.images[0] || "/placeholder.svg"}
                alt={post.title}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
          )}
          <p className="text-muted-foreground mb-4 break-words whitespace-normal">
            {post.shortDescription || "No description available."}
          </p>
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={post.authorProfilePicture || undefined} />
              <AvatarFallback>{(post.authorName && post.authorName[0]) || "U"}</AvatarFallback>
            </Avatar>
            <Link
              href={`/user/${post.author}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors break-words whitespace-normal"
            >
              {post.authorName || "Unknown Author"}
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex space-x-4 text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Heart className="h-4 w-4 flex-shrink-0" />
              <span>{post.likes || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="h-4 w-4 flex-shrink-0" />
              <span>{post.views || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              <span>{post.comments?.length || 0}</span>
            </span>
          </div>
          <Link href={`/blog/${post.id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex-shrink-0"
            >
              Read More
            </motion.button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

