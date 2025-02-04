"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuthContext } from "./AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "next-themes"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { supabase } from "../lib/supabase"
import { SuccessPopup } from "./SuccessPopup"

const adminUID = "KeupJB92W7On78VJlEMg6GMsgVC3"

const UploadButton = ({ uploading }: { uploading: boolean }) => (
  <Button variant="outline" className="relative cursor-pointer" disabled={uploading} type="button">
    {uploading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Uploading...
      </>
    ) : (
      <>
        <Camera className="mr-2 h-4 w-4" />
        Change Picture
      </>
    )}
  </Button>
)

export default function UserSettings() {
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [lastUsernameChange, setLastUsernameChange] = useState<Date | null>(null)
  const [changeCount, setChangeCount] = useState(0)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUsernameSuccess, setShowUsernameSuccess] = useState(false)
  const [showBioSuccess, setShowBioSuccess] = useState(false)
  const [showProfilePictureSuccess, setShowProfilePictureSuccess] = useState(false)
  const { user } = useAuthContext()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setUsername(data.username || user.displayName || "")
        setBio(data.bio || "")
        setLastUsernameChange(data.lastUsernameChange?.toDate() || null)
        setChangeCount(data.usernameChangeCount || 0)
        setProfilePicture(data.profilePicture || null)
      }
    }

    fetchUserData()
  }, [user])

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const now = new Date()
    const docRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        username,
        lastUsernameChange: now,
        usernameChangeCount: user.uid === adminUID ? 0 : (docSnap.data().usernameChangeCount || 0) + 1,
      })
    } else {
      await setDoc(docRef, {
        username,
        lastUsernameChange: now,
        usernameChangeCount: 0,
        favorites: [],
      })
    }

    setLastUsernameChange(now)
    setChangeCount((prevCount) => (user.uid === adminUID ? 0 : prevCount + 1))
    setShowUsernameSuccess(true)
    setTimeout(() => setShowUsernameSuccess(false), 3000)
  }

  const handleBioChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const docRef = doc(db, "users", user.uid)
    await updateDoc(docRef, { bio })

    setShowBioSuccess(true)
    setTimeout(() => setShowBioSuccess(false), 3000)
  }

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage.from("profile_pictures").upload(fileName, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_pictures").getPublicUrl(fileName)

      setProfilePicture(publicUrl)

      // Update the user's profile picture in Firestore
      if (user) {
        const docRef = doc(db, "users", user.uid)
        await updateDoc(docRef, { profilePicture: publicUrl })
        setShowProfilePictureSuccess(true)
        setTimeout(() => setShowProfilePictureSuccess(false), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Upload failed",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    uploadImage(e.target.files[0])
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Username</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUsernameChange} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="New username"
                required
              />
              <p className="text-sm text-muted-foreground">
                Changes remaining: {user?.uid === adminUID ? "Unlimited" : Math.max(0, 2 - changeCount)}
              </p>
              {lastUsernameChange && (
                <p className="text-sm text-muted-foreground">Last changed: {lastUsernameChange.toLocaleDateString()}</p>
              )}
            </div>
            <Button type="submit">Update Username</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBioChange} className="space-y-4">
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your bio"
              rows={4}
            />
            <Button type="submit">Update Bio</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profilePicture || undefined} />
              <AvatarFallback>{username[0]}</AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploading}
                />
                <UploadButton uploading={uploading} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
      <SuccessPopup message="Username updated successfully" isVisible={showUsernameSuccess} />
      <SuccessPopup message="Bio updated successfully" isVisible={showBioSuccess} />
      <SuccessPopup message="Profile picture updated successfully" isVisible={showProfilePictureSuccess} />
    </div>
  )
}

