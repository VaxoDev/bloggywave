import { useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type UserCredential,
} from "firebase/auth"
import { auth } from "../lib/firebase"

export function useAuth() {
  const [error, setError] = useState<string | null>(null)

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setError("Failed to sign in")
      console.error(error)
      throw error
    }
  }

  const signUp = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential
    } catch (error) {
      setError("Failed to sign up")
      console.error(error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      return await signInWithPopup(auth, provider)
    } catch (error) {
      setError("Failed to sign in with Google")
      console.error(error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      setError("Failed to sign out")
      console.error(error)
      throw error
    }
  }

  return { signIn, signUp, signInWithGoogle, signOut, error }
}

