"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api"

export default function SetupPin() {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [loading, setLoading] = useState(false)
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.hasPinSetup) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numeric input and max 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value)
    }
  }

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numeric input and max 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setConfirmPin(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
      })
      return
    }

    if (pin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "Please make sure your PINs match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await api.post("/api/users/setup-pin", { pin })
      await refreshUser() // Refresh user data to update PIN status

      toast({
        title: "PIN setup successful!",
        description: "Your PIN has been set up successfully.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "PIN setup failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null // Don't render anything while checking auth status
  }

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card>
        <CardHeader className="text-center">
          <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
          <CardTitle>Set Up Your PIN</CardTitle>
          <CardDescription>Create a 4-digit PIN to secure your transactions</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="pin" className="text-center block">
                Enter a 4-digit PIN
              </label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                className="text-center text-xl"
                placeholder="••••"
                value={pin}
                onChange={handlePinChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPin" className="text-center block">
                Confirm your PIN
              </label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                className="text-center text-xl"
                placeholder="••••"
                value={confirmPin}
                onChange={handleConfirmPinChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up PIN...
                </>
              ) : (
                "Set PIN"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
