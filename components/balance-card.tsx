import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

interface BalanceCardProps {
  balance: number
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Current Balance</CardDescription>
        <CardTitle className="text-4xl">₹{balance.toFixed(2)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm">
          <div className="flex items-center text-green-600">
            <ArrowDownLeft className="mr-1 h-4 w-4" />
            <span>Income</span>
          </div>
          <div className="flex items-center text-red-600">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            <span>Expenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
