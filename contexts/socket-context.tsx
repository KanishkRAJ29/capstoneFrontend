"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth-context"
import { useToast } from "@/components/ui/use-toast"

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Only connect to socket if user is logged in
    if (user) {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

      console.log("Connecting to socket at:", apiUrl)

      // Create socket connection
      const socketInstance = io(apiUrl, {
        auth: {
          token,
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      socketInstance.on("connect", () => {
        console.log("Socket connected with ID:", socketInstance.id)
      })

      socketInstance.on("connect_error", (err) => {
        console.error("Socket connection error:", err)
      })

      socketInstance.on("reconnect", (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`)
      })

      socketInstance.on("reconnect_error", (err) => {
        console.error("Socket reconnection error:", err)
        toast({
          title: "Connection Error",
          description: "Failed to reconnect to the server. Some features may not work.",
          variant: "destructive",
        })
      })

      setSocket(socketInstance)

      // Cleanup on unmount
      return () => {
        console.log("Disconnecting socket")
        socketInstance.disconnect()
      }
    } else {
      // Disconnect if user logs out
      if (socket) {
        console.log("User logged out, disconnecting socket")
        socket.disconnect()
        setSocket(null)
      }
    }
  }, [user, toast])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}

export function useSocket() {
  return useContext(SocketContext)
}
