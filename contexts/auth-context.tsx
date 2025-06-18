"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api } from "@/lib/api"

interface User {
  _id: string
  username: string
  email: string
  merchantId: string
  balance: number
  hasPinSetup: boolean
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (username: string, email: string, password: string) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await api.get("/api/users/me")
          setUser(response.data.user)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("token")
        delete api.defaults.headers.common["Authorization"]
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post("/api/auth/login", { email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setUser(user)

    return user
  }

  const register = async (username: string, email: string, password: string): Promise<User> => {
    const response = await api.post("/api/auth/register", { username, email, password })
    const { token, user } = response.data

    localStorage.setItem("token", token)
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setUser(user)

    return user
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete api.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.get("/api/users/me")
      setUser(response.data.user)
      return response.data.user
    } catch (error) {
      console.error("Failed to refresh user:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
