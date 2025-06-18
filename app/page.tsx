import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Wallet, QrCode, Shield, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-emerald-500 to-teal-600 py-20 px-4 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">PayBand: Payments at Your Fingertip</h1>
              <p className="text-lg md:text-xl opacity-90">
                The seamless digital wallet platform with wearable technology integration. Send and receive money with
                just a scan and a touch.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <div className="absolute inset-4 bg-white/30 rounded-full blur-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Wallet className="h-10 w-10 text-emerald-500" />}
              title="Digital Wallet"
              description="Manage your money digitally with secure deposits and withdrawals. Track all your transactions in one place."
            />
            <FeatureCard
              icon={<QrCode className="h-10 w-10 text-emerald-500" />}
              title="QR Payments"
              description="Send and request money instantly using QR codes. No need to remember account numbers or IDs."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-emerald-500" />}
              title="Biometric Security"
              description="Authorize payments with your fingerprint on the PayBand watch for maximum security."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  Web Application
                </CardTitle>
                <CardDescription>Manage your wallet from any device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>1. Register and set up your secure 4-digit PIN</p>
                <p>2. View your balance and transaction history</p>
                <p>3. Generate QR codes to request payments</p>
                <p>4. Receive real-time notifications for all transactions</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/register">Create Account</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-500" />
                  PayBand Watch
                </CardTitle>
                <CardDescription>Send money on the go with your wearable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>1. Scan merchant QR code with your PayBand watch</p>
                <p>2. Hear payment details through the built-in speaker</p>
                <p>3. Authorize with your fingerprint</p>
                <p>4. Get instant confirmation with vibration feedback</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-emerald-500 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Experience the Future of Payments?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join PayBand today and transform how you send and receive money with our innovative wearable technology.
          </p>
          <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
            <Link href="/register" className="flex items-center gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white">PayBand</h3>
              <p>© 2023 PayBand. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white">
                Terms
              </Link>
              <Link href="#" className="hover:text-white">
                Privacy
              </Link>
              <Link href="#" className="hover:text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  )
}
