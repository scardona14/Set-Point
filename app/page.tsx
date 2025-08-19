"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Users, Trophy, Plus, Bell, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface Match {
  id: string
  opponent: string
  date: string
  time: string
  location: string
  status: "upcoming" | "completed" | "in-progress"
  score?: string
  notes?: string
}

const USERS_STORAGE_KEY = "setpoint_users"
const CURRENT_USER_KEY = "setpoint_current_user"

const getUserData = (userId: string) => {
  if (typeof window === "undefined") return null
  const key = `setpoint_user_${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

const saveUserData = (userId: string, data: any) => {
  if (typeof window === "undefined") return
  const key = `setpoint_user_${userId}`
  localStorage.setItem(key, JSON.stringify(data))
}

const getAllUsers = (): any[] => {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(USERS_STORAGE_KEY)
  return users ? JSON.parse(users) : []
}

const saveUser = (user: any) => {
  if (typeof window === "undefined") return
  const users = getAllUsers()
  const existingIndex = users.findIndex((u) => u.id === user.id)
  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const findUserByEmail = (email: string): any | null => {
  const users = getAllUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

interface AppUser {
  id: string
  name: string
  email: string
  avatar?: string
  skillLevel?: string
  bio?: string
  location?: string
  joinDate?: string
}

export default function TennisMatchOrganizer() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [authError, setAuthError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const savedUserId = localStorage.getItem(CURRENT_USER_KEY)
    if (savedUserId) {
      const users = getAllUsers()
      const user = users.find((u) => u.id === savedUserId)
      if (user) {
        setCurrentUser(user)
        // Load user's matches
        const userData = getUserData(savedUserId)
        if (userData?.matches) {
          setMatches(userData.matches)
        }
      }
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      if (isSignUp) {
        // Registration
        if (!name || !email || !password) {
          setAuthError("All fields are required")
          return
        }

        if (password.length < 6) {
          setAuthError("Password must be at least 6 characters")
          return
        }

        const existingUser = findUserByEmail(email)
        if (existingUser) {
          setAuthError("An account with this email already exists")
          return
        }

        const newUser: AppUser = {
          id: Date.now().toString(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          skillLevel: "intermediate",
          joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          bio: "",
          location: "",
        }

        saveUser(newUser)
        localStorage.setItem(CURRENT_USER_KEY, newUser.id)

        // Initialize empty user data
        saveUserData(newUser.id, {
          matches: [],
          friends: [],
          notifications: [],
        })

        setCurrentUser(newUser)
        setMatches([]) // New users start with no matches
      } else {
        // Login
        if (!email || !password) {
          setAuthError("Email and password are required")
          return
        }

        const user = findUserByEmail(email)
        if (!user) {
          setAuthError("No account found with this email")
          return
        }

        localStorage.setItem(CURRENT_USER_KEY, user.id)
        setCurrentUser(user)

        // Load user's data
        const userData = getUserData(user.id)
        if (userData?.matches) {
          setMatches(userData.matches)
        }
      }
    } catch (error) {
      setAuthError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(CURRENT_USER_KEY)
    setCurrentUser(null)
    setMatches([])
    setAuthError("")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <Image
                src="/tennis-ball-realistic.png"
                alt="Set Point Logo"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            <CardTitle className="font-serif text-2xl">Set Point</CardTitle>
            <CardDescription>
              Your ultimate tennis organizer - organize matches with friends, track scores, and stay connected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert className="mb-4 border-red-200 bg-red-50 text-red-800">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}
            <Tabs value={isSignUp ? "signup" : "signin"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="signin"
                  onClick={() => {
                    setIsSignUp(false)
                    setAuthError("")
                  }}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  onClick={() => {
                    setIsSignUp(true)
                    setAuthError("")
                  }}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" name="password" type="password" minLength={6} required />
                    <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center">
                <Image
                  src="/tennis-ball-realistic.png"
                  alt="Set Point Logo"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <h1 className="font-serif text-xl font-bold">Set Point</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{matches.filter((m) => m.status === "upcoming").length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Tennis Friends</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Trophy className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{matches.filter((m) => m.status === "completed").length}</p>
                  <p className="text-sm text-muted-foreground">Matches Played</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message for New Users */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <Image
                src="/tennis-ball-realistic.png"
                alt="Tennis Ball"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">Welcome to Set Point, {currentUser.name}!</h3>
            <p className="text-muted-foreground mb-4">
              Ready to organize your first tennis match? Start building your tennis network and tracking your progress.
            </p>
            <div className="flex gap-2 justify-center">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your First Match
              </Button>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Find Tennis Friends
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
