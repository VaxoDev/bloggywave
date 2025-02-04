"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuthContext } from "../../components/AuthProvider"
import AdminDashboard from "../../components/AdminDashboard"
import UserDashboard from "../../components/UserDashboard"
import { ProtectedRoute } from "../../components/ProtectedRoute"

const ADMIN_UID = "KeupJB92W7On78VJlEMg6GMsgVC3"

export default function Dashboard() {
  const { user } = useAuthContext()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        const userData = userDoc.data()
        setIsAdmin(userData?.isAdmin || user.uid === ADMIN_UID)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {isAdmin ? "Admin Dashboard" : "User Dashboard"}
        </h1>
        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </div>
    </ProtectedRoute>
  )
}

