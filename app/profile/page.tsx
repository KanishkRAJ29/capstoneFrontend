"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Copy, LogOut, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import QRCode from "@/components/qr-code"

export default function Profile() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleCopyMerchantId = () => {
    if (user && user.merchantId) {
      navigator.clipboard.writeText(user.merchantId)
      toast({
        title: "Copied",
        description: "Merchant ID copied to clipboard",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return null // Don't render anything while checking auth status
  }

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Link href="/dashboard" className="flex items-center text-sm mb-6 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>View and manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-emerald-600">{user.username.charAt(0).toUpperCase()}</span>
            </div>
          </div>

          <div className="space-y-1 text-center">
            <h3 className="text-xl font-bold">{user.username}</h3>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Merchant ID</span>
              <div className="flex items-center">
                <span className="font-mono mr-2">{user.merchantId.substring(0, 8)}...</span>
                <Button variant="ghost" size="icon" onClick={handleCopyMerchantId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">PIN Status</span>
              <div className="flex items-center">
                {user.hasPinSetup ? (
                  <span className="text-green-600 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Set up
                  </span>
                ) : (
                  <Link href="/setup-pin" className="text-red-600 hover:underline">
                    Not set up
                  </Link>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current Balance</span>
              <span className="font-bold">₹{user.balance.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <p className="text-sm text-center font-medium">Your Merchant QR Code</p>
            <div className="mx-auto w-64 h-64 border rounded-lg p-2 bg-white">
              <QRCode data={JSON.stringify({ merchantId: user.merchantId })} />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                This QR code contains your merchant ID for receiving payments
              </p>
              <div className="flex items-center justify-center gap-2 bg-muted p-2 rounded-md">
                <span className="font-mono text-sm">{user.merchantId}</span>
                <Button variant="ghost" size="icon" onClick={handleCopyMerchantId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/change-password">Change Password</Link>
          </Button>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
