"use client"

import type React from "react"

import { createContext, useContext } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: any
  status: "loading" | "authenticated" | "unauthenticated"
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
  signIn: async () => false,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    return result?.ok || false
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        status,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
