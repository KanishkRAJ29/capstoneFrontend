"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Loader2, ShieldAlert } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface PINModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: () => void
}

export default function PINModal({ isOpen, onClose, onVerify }: PINModalProps) {
  const [pin, setPin] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const { toast } = useToast()

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numeric input and max 4 digits
    if (/^\d*$/.test(value) && value.length <= 4) {
      setPin(value)
    }
  }

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)

    try {
      const response = await api.post("/api/users/verify-pin", { pin })

      if (response.data.verified) {
        toast({
          title: "PIN Verified",
          description: "Your PIN has been verified successfully.",
        })
        setPin("")
        setAttempts(0)
        onVerify()
      } else {
        setAttempts(attempts + 1)
        toast({
          title: "Incorrect PIN",
          description: `PIN verification failed. ${3 - attempts} attempts remaining.`,
          variant: "destructive",
        })

        if (attempts >= 2) {
          toast({
            title: "Too many attempts",
            description: "You've exceeded the maximum number of attempts. Please try again later.",
            variant: "destructive",
          })
          onClose()
        }
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "An error occurred during verification",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerifyPin()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-500" />
            Enter Your PIN
          </DialogTitle>
          <DialogDescription>Please enter your 4-digit PIN to authorize this transaction.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            className="text-center text-xl"
            placeholder="••••"
            value={pin}
            onChange={handlePinChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleVerifyPin} disabled={pin.length !== 4 || isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
