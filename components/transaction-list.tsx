"use client"

import { useState } from "react"
import { ArrowDownLeft, ArrowUpRight, CreditCard, Loader2, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"

interface Transaction {
  _id: string
  type: "deposit" | "withdrawal" | "sent" | "received"
  amount: number
  description: string
  otherParty?: string
  createdAt: string
}

interface TransactionListProps {
  transactions: Transaction[]
  isLoading: boolean
}

export default function TransactionList({ transactions, isLoading }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.otherParty && transaction.otherParty.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <Plus className="h-5 w-5 text-green-500" />
      case "withdrawal":
        return <ArrowUpRight className="h-5 w-5 text-red-500" />
      case "sent":
        return <ArrowUpRight className="h-5 w-5 text-red-500" />
      case "received":
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "received":
        return "text-green-600"
      case "withdrawal":
      case "sent":
        return "text-red-600"
      default:
        return ""
    }
  }

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case "deposit":
      case "received":
        return "+"
      case "withdrawal":
      case "sent":
        return "-"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[400px]">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <CreditCard className="h-12 w-12 mb-4 opacity-20" />
            <p>No transactions found</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                  {getAmountPrefix(transaction.type)}₹{transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
