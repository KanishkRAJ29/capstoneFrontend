"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, Home, CreditCard, QrCode, Shield } from "lucide-react"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check if current path is active
  const isActive = (path: string) => pathname === path

  // Don't show navbar on auth pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/setup-pin") {
    return null
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-sm border-b"
          : pathname === "/"
            ? "bg-transparent"
            : "bg-background border-b"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <CreditCard className="h-6 w-6 text-emerald-500" />
                  <span className="text-xl">PayBand</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  <MobileNavLink href="/" icon={<Home className="h-5 w-5" />} isActive={isActive("/")}>
                    Home
                  </MobileNavLink>
                  {user ? (
                    <>
                      <MobileNavLink
                        href="/dashboard"
                        icon={<CreditCard className="h-5 w-5" />}
                        isActive={isActive("/dashboard")}
                      >
                        Dashboard
                      </MobileNavLink>
                      <MobileNavLink
                        href="/request-money"
                        icon={<QrCode className="h-5 w-5" />}
                        isActive={isActive("/request-money")}
                      >
                        Request Money
                      </MobileNavLink>
                      <MobileNavLink
                        href="/profile"
                        icon={<User className="h-5 w-5" />}
                        isActive={isActive("/profile")}
                      >
                        Profile
                      </MobileNavLink>
                      {user.role === "admin" && (
                        <MobileNavLink
                          href="/admin"
                          icon={<Shield className="h-5 w-5" />}
                          isActive={isActive("/admin")}
                        >
                          Admin
                        </MobileNavLink>
                      )}
                      <button
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:text-foreground"
                        onClick={logout}
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <MobileNavLink href="/login" icon={<User className="h-5 w-5" />} isActive={isActive("/login")}>
                        Login
                      </MobileNavLink>
                      <MobileNavLink
                        href="/register"
                        icon={<User className="h-5 w-5" />}
                        isActive={isActive("/register")}
                      >
                        Register
                      </MobileNavLink>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-6 w-6 text-emerald-500" />
            <span className={`text-xl ${pathname === "/" && !isScrolled ? "text-white" : ""}`}>PayBand</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/" isActive={isActive("/")} isHome={pathname === "/" && !isScrolled}>
            Home
          </NavLink>
          {user && (
            <>
              <NavLink href="/dashboard" isActive={isActive("/dashboard")} isHome={pathname === "/" && !isScrolled}>
                Dashboard
              </NavLink>
              <NavLink
                href="/request-money"
                isActive={isActive("/request-money")}
                isHome={pathname === "/" && !isScrolled}
              >
                Request Money
              </NavLink>
              {user.role === "admin" && (
                <NavLink href="/admin" isActive={isActive("/admin")} isHome={pathname === "/" && !isScrolled}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-sm font-medium text-emerald-700">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/request-money">
                    <QrCode className="mr-2 h-4 w-4" />
                    Request Money
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant={pathname === "/" && !isScrolled ? "outline" : "default"} size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant={pathname === "/" && !isScrolled ? "default" : "outline"} size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children, isActive, isHome }) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        isActive
          ? "text-foreground"
          : isHome
            ? "text-white hover:text-white/80"
            : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, icon, children, isActive }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-3 py-2 ${
        isActive ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}
