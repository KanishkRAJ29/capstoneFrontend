"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Search, UserPlus } from "lucide-react"
import { api } from "@/lib/api"

export default function Admin() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [addFundsData, setAddFundsData] = useState({
    merchantId: "",
    amount: "",
  })
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if user is not logged in or not an admin
  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (user.role !== "admin") {
      router.push("/dashboard")
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      })
    } else {
      fetchUsers()
    }
  }, [user, router, toast])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("/api/admin/users")
      setUsers(response.data.users)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddFundsData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!addFundsData.merchantId || !addFundsData.amount || Number.parseFloat(addFundsData.amount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid merchant ID and amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await api.post("/api/admin/add-funds", {
        merchantId: addFundsData.merchantId,
        amount: Number.parseFloat(addFundsData.amount),
      })

      toast({
        title: "Funds Added",
        description: `₹${addFundsData.amount} added to merchant ID ${addFundsData.merchantId}`,
      })

      setAddFundsData({
        merchantId: "",
        amount: "",
      })

      fetchUsers() // Refresh user list to show updated balance
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add funds",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.merchantId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!user || user.role !== "admin") {
    return null // Don't render anything if not admin
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Add Funds Card */}
        <Card>
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
            <CardDescription>Add funds to a user's wallet</CardDescription>
          </CardHeader>
          <form onSubmit={handleAddFunds}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchantId">Merchant ID</Label>
                <Input
                  id="merchantId"
                  name="merchantId"
                  placeholder="Enter merchant ID"
                  value={addFundsData.merchantId}
                  onChange={handleAddFundsChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={addFundsData.amount}
                  onChange={handleAddFundsChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Funds
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Users List Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage registered users</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Merchant ID</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>PIN Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="font-mono text-xs">{user.merchantId}</TableCell>
                        <TableCell>₹{user.balance.toFixed(2)}</TableCell>
                        <TableCell>
                          {user.hasPinSetup ? (
                            <span className="text-green-600">Set</span>
                          ) : (
                            <span className="text-red-600">Not Set</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
