"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Home, BookOpen, Settings, Heart, LogOut, PlusCircle } from "lucide-react"
import { useAuthContext } from "./AuthProvider"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmationDialog } from "./ConfirmationDialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogoText } from "./LogoText"
import { Input } from "@/components/ui/input"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"

const adminUID = "zyCcTrjMJkPBvilOL9rtlQogyIO2"

export function Header() {
  const { user } = useAuthContext()
  const { signOut } = useAuth()
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const isAdmin = user?.uid === adminUID

  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setProfilePicture(userDoc.data().profilePicture || null)
        }
      }
    }
    fetchProfilePicture()
  }, [user])

  const handleSignOut = () => {
    setIsSignOutDialogOpen(true)
  }

  const confirmSignOut = () => {
    signOut()
    setIsSignOutDialogOpen(false)
  }

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/blog", icon: BookOpen, label: "Blog" },
    { href: "/favorites", icon: Heart, label: "Favorites" },
    { href: "/dashboard", icon: Settings, label: isAdmin ? "Dashboard" : "Settings" },
    ...(user ? [{ href: "/create-post", icon: PlusCircle, label: "New Post" }] : []),
  ]

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
  }

  return (
    <header className="sticky top-0 z-50 w-full max-w-6xl pl-3 pr-3 mx-auto border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-b-xl">
      <div className="container mx-auto max-w-6xl flex h-14 items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="hidden sm:block">
            <LogoText variant="default" />
          </div>
          <div className="sm:hidden">
            <LogoText variant="minimalist" />
          </div>
        </Link>
        {user && (
          <>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="md:hidden ml-auto flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={profilePicture || user.photoURL || undefined} />
                    <AvatarFallback>
                      {profilePicture ? (
                        <img
                          src={profilePicture || "/placeholder.svg"}
                          alt={user.email || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.email?.charAt(0).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
        <div className="ml-auto hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <div className="relative">
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "200px", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isSignOutDialogOpen}
        onClose={() => setIsSignOutDialogOpen(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
      />
    </header>
  )
}

