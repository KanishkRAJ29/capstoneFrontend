"use client"

import { useEffect, useRef } from "react"
import QRCodeLib from "qrcode"

interface QRCodeProps {
  data: string
  size?: number
  level?: "L" | "M" | "Q" | "H"
  className?: string
}

export default function QRCode({ data, size = 256, level = "M", className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCodeLib.toCanvas(
        canvasRef.current,
        data,
        {
          width: size,
          margin: 1,
          errorCorrectionLevel: level,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error)
        },
      )
    }
  }, [data, size, level])

  // Determine if this is a merchant ID QR code
  const isMerchantQR = data.includes("merchantId") && !data.includes("amount")

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <canvas ref={canvasRef} />
        {isMerchantQR && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 rounded-full p-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-xl font-bold text-emerald-600">PB</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
