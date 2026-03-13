"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarDays, Users, Trophy, Plus, MapPin, Clock, Play, Trash2, Cloud, Sun, CloudRain, Wind } from "lucide-react"
import { CreateMatchDialog } from "@/components/create-match-dialog"
import { ScoreTracker } from "@/components/score-tracker"
import { FriendsManager } from "@/components/friends-manager"
import { NotificationCenter } from "@/components/notification-center"
import { UserProfileMenu } from "@/components/user-profile-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  matchFormat?: "singles" | "doubles"
  doublesPartner?: string
  winner?: string // "player1" or "player2"
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  skillLevel?: string
  bio?: string
  location?: string
  joinDate?: string
  skills?: {
    serve: number
    forehand: number
    backhand: number
    netPlay: number
  }
  friends?: string[]
  matchInvites?: string[]
}

const getMatchCultureLabels = (score?: string) => {
  if (!score) return []
  const sets = score.split(",").map(s => s.trim())
  const labels: string[] = []
  
  let bagels = 0
  let breadsticks = 0
  
  sets.forEach(set => {
    if (set === "6-0" || set === "0-6") bagels++
    if (set === "6-1" || set === "1-6") breadsticks++
  })
  
  if (bagels >= 2) labels.push("Double Bagel 🥯🥯")
  else if (bagels === 1) labels.push("Bagel 🥯")
  
  if (breadsticks > 0) labels.push("Breadstick 🥖")
  
  return labels
}

const USERS_STORAGE_KEY = "setpoint_users"
const CURRENT_USER_KEY = "setpoint_current_user"

const getUserData = (userId: string) => {
  const key = `setpoint_user_${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

const saveUserData = (userId: string, data: any) => {
  const key = `setpoint_user_${userId}`
  localStorage.setItem(key, JSON.stringify(data))
}

const getAllUsers = (): User[] => {
  const users = localStorage.getItem(USERS_STORAGE_KEY)
  return users ? JSON.parse(users) : []
}

const saveUser = (user: User) => {
  const users = getAllUsers()
  const existingIndex = users.findIndex((u) => u.id === user.id)
  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const findUserByEmail = (email: string): User | null => {
  const users = getAllUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export default function TennisMatchOrganizer() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [showScoreTracker, setShowScoreTracker] = useState(false)
  const [showFriendsManager, setShowFriendsManager] = useState(false)
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [showMatchHistory, setShowMatchHistory] = useState(false)
  const [authError, setAuthError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null)

  // New Feature States
  const [weeklyChallenge, setWeeklyChallenge] = useState({
    title: "Play 3 matches this week",
    target: 3,
    progress: 0,
    completed: false
  })

  const [discoveryPlayers] = useState([
    { id: "1", name: "Carlos R.", distance: "2.1 mi", winRate: "68%", avatar: "CR" },
    { id: "2", name: "Maria V.", distance: "3.5 mi", winRate: "54%", avatar: "MV" },
    { id: "3", name: "David S.", distance: "5.0 mi", winRate: "72%", avatar: "DS" }
  ])

  useEffect(() => {
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
          
          const currentWeekMatches = userData.matches.filter((m: Match) => m.status === 'completed').length
          setWeeklyChallenge(prev => ({
            ...prev,
            progress: Math.min(currentWeekMatches, prev.target),
            completed: currentWeekMatches >= prev.target
          }))
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

        const newUser: User = {
          id: Date.now().toString(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          skillLevel: "intermediate",
          joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          bio: "",
          location: "San Juan, PR",
          friends: [],
          matchInvites: [],
          skills: {
            serve: 0,
            forehand: 0,
            backhand: 0,
            netPlay: 0
          }
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

        // In a real app, you'd verify the password hash here
        // For now, we'll just check if the user exists
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
    localStorage.removeItem(CURRENT_USER_KEY)
    setCurrentUser(null)
    setShowCreateMatch(false)
    setShowScoreTracker(false)
    setShowFriendsManager(false)
    setActiveMatch(null)
    setShowMatchHistory(false)
    setMatches([])
    setAuthError("")
  }

  const handleUpdateProfile = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    saveUser(updatedUser)
  }

  const handleCreateMatch = (matchData: Omit<Match, "id" | "status">) => {
    const newMatch: Match = {
      ...matchData,
      id: Date.now().toString(),
      status: "upcoming",
    }
    const updatedMatches = [newMatch, ...matches]
    setMatches(updatedMatches)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      userData.matches = updatedMatches
      saveUserData(currentUser.id, userData)
    }
  }

  const handleStartScoreTracking = (match: Match) => {
    setActiveMatch(match)
    setShowScoreTracker(true)
    const updatedMatches = matches.map((m) => (m.id === match.id ? { ...m, status: "in-progress" as const } : m))
    setMatches(updatedMatches)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      userData.matches = updatedMatches
      saveUserData(currentUser.id, userData)
    }
  }

  const handleSaveScore = (matchId: string, finalScore: string, winner: string) => {
    const updatedMatches = matches.map((match) =>
      match.id === matchId ? { ...match, status: "completed" as const, score: finalScore, winner } : match,
    )
    setMatches(updatedMatches)
    setActiveMatch(null)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      userData.matches = updatedMatches
      saveUserData(currentUser.id, userData)
    }
  }

  const handleFriendRequestAction = (notificationId: string, action: "accept" | "reject") => {
    console.log(`Friend request ${notificationId} ${action}ed`)
    if (action === "accept") {
    }
  }

  const handleMatchInvitationAction = (notificationId: string, action: "accept" | "reject") => {
    console.log(`Match invitation ${notificationId} ${action}ed`)
    if (action === "accept") {
      const newMatch: Match = {
        id: Date.now().toString(),
        opponent: "Alex Rodriguez",
        date: "2024-01-21",
        time: "15:00",
        location: "City Sports Complex",
        status: "upcoming",
      }
      setMatches((prev) => [newMatch, ...prev])
    }
  }

  const handleDeleteMatch = (matchId: string) => {
    const updatedMatches = matches.filter((m) => m.id !== matchId)
    setMatches(updatedMatches)
    setMatchToDelete(null)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      userData.matches = updatedMatches
      saveUserData(currentUser.id, userData)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getMatchStats = () => {
    const completedMatches = matches.filter((m) => m.status === "completed")
    const wins = completedMatches.filter((m) => m.winner === "player1").length
    const losses = completedMatches.length - wins
    const winRate = completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0

    return { wins, losses, winRate, totalMatches: completedMatches.length }
  }

  const matchStats = getMatchStats()

  const getWinStreak = () => {
    let streak = 0
    const completedMatches = matches
      .filter((m) => m.status === "completed")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    for (const match of completedMatches) {
      if (match.score && match.score.includes("6-")) {
        streak++
      } else {
        break // Streak broken
      }
    }
    return streak
  }
  
  const winStreak = getWinStreak()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const [weatherData, setWeatherData] = useState<{temp: number, condition: string, playability: string, isLoaded: boolean}>({
    temp: 0,
    condition: "",
    playability: "",
    isLoaded: false
  })

  // Basic weather stub based on location string containing "PR"
  useEffect(() => {
    const loc = currentUser?.location || ""
    if (loc) {
      // Fake a weather API delay
      setTimeout(() => {
        const isTropical = loc.includes("PR") || loc.includes("FL")
        
        setWeatherData({
          temp: isTropical ? 84 : 68,
          condition: isTropical ? "Sunny" : "Partly Cloudy",
          playability: "Play ball",
          isLoaded: true
        })
      }, 800)
    }
  }, [currentUser?.location])

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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 mt-1 items-center justify-center">
                <Image
                  src="/apple-icon.png"
                  alt="Set Point Logo"
                  width={40}
                  height={40}
                  className="rounded-full shadow-[0_0_10px_rgba(204,255,0,0.4)]"
                />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-wide">
                  {getGreeting()}, {currentUser.name.split(' ')[0]}
                </h1>
                {winStreak > 0 ? (
                  <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30 mt-1 font-serif tracking-widest">
                    WIN STREAK ACTIVE · {winStreak} MATCH{winStreak !== 1 ? 'ES' : ''}
                  </Badge>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1 font-serif tracking-widest">GET BACK ON THE COURT</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <NotificationCenter
                  currentUserId={currentUser.id}
                  onFriendRequestAction={handleFriendRequestAction}
                  onMatchInvitationAction={handleMatchInvitationAction}
                />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,240,255,0.8)] border border-background"></span>
              </div>
              <UserProfileMenu user={currentUser} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />
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
                  <p className="text-4xl font-serif font-bold">{matches.filter((m) => m.status === "upcoming").length}</p>
                  <p className="text-sm font-serif tracking-wider text-muted-foreground uppercase">Upcoming Matches</p>
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
                  <p className="text-4xl font-serif font-bold">0</p>
                  <p className="text-sm font-serif tracking-wider text-muted-foreground uppercase">Tennis Friends</p>
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
                  <p className="text-4xl font-serif font-bold">{matches.filter((m) => m.status === "completed").length}</p>
                  <p className="text-sm font-serif tracking-wider text-muted-foreground uppercase">Matches Played</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-b-4 border-b-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                  <Trophy className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                </div>
                <div>
                  <p className="text-4xl font-serif font-bold text-primary">{matchStats.winRate}%</p>
                  <p className="text-sm font-serif tracking-wider text-primary/80 uppercase">Win Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="matches" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                <TabsTrigger value="matches" className="data-[state=active]:shadow-[0_0_15px_rgba(0,240,255,0.3)] data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-serif tracking-wide uppercase">Matches</TabsTrigger>
                <TabsTrigger value="tournaments" className="data-[state=active]:shadow-[0_0_15px_rgba(0,240,255,0.3)] data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-serif tracking-wide uppercase">Tournaments</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:shadow-[0_0_15px_rgba(0,240,255,0.3)] data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-serif tracking-wide uppercase">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold">Your Matches</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowMatchHistory(true)}>
                      <Trophy className="h-4 w-4 mr-2" />
                      History
                    </Button>
                    <Button onClick={() => setShowCreateMatch(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Match
                    </Button>
                  </div>
                </div>

                {matches.length === 0 && !showMatchHistory ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                        <Image
                          src="/apple-icon.png"
                          alt="Tennis Ball"
                          width={64}
                          height={64}
                          className="rounded-full"
                        />
                      </div>
                      <h3 className="font-serif text-xl font-semibold mb-2">Welcome to Set Point!</h3>
                      <p className="text-muted-foreground mb-4">
                        Ready to organize your first tennis match? Click "New Match" to get started and begin tracking
                        your tennis journey.
                      </p>
                      <Button onClick={() => setShowCreateMatch(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Your First Match
                      </Button>
                    </CardContent>
                  </Card>
                ) : showMatchHistory ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-xl font-semibold">Match History</h3>
                      <Button variant="ghost" onClick={() => setShowMatchHistory(false)}>
                        Back to Current
                      </Button>
                    </div>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="font-serif">Your Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{matchStats.wins}</p>
                            <p className="text-sm text-muted-foreground">Wins</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-600">{matchStats.losses}</p>
                            <p className="text-sm text-muted-foreground">Losses</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{matchStats.totalMatches}</p>
                            <p className="text-sm text-muted-foreground">Total Matches</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{matchStats.winRate}%</p>
                            <p className="text-sm text-muted-foreground">Win Rate</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {matches.filter((m) => m.status === "completed").length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No completed matches yet. Start playing to build your history!
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {matches
                          .filter((m) => m.status === "completed")
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((match) => (
                            <Card key={match.id} className="hover:shadow-[0_4px_20px_rgba(0,240,255,0.1)] hover:border-primary/50 transition-all cursor-pointer bg-card">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                        {match.opponent
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-semibold text-lg">{match.opponent}</p>
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1">
                                          <CalendarDays className="h-3 w-3" />
                                          {formatDate(match.date)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {match.location}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-2">
                                    <Badge variant="secondary" className="capitalize">
                                      Completed
                                    </Badge>
                                    {match.score && (
                                      <div className="flex gap-1 mt-1">
                                        {match.score.split(',').map((set, i) => (
                                          <Badge key={i} variant="secondary" className="text-sm bg-primary/20 text-primary border-primary/30 font-serif tracking-wider">
                                            {set.trim()}
                                          </Badge>
                                        ))}
                                        {getMatchCultureLabels(match.score).map((label, i) => (
                                          <Badge key={`label-${i}`} variant="default" className="text-sm bg-secondary text-primary font-serif tracking-wider border-primary/50">
                                            {label}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {match.notes && (
                                  <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm text-muted-foreground">{match.notes}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {matches.filter((m) => m.status !== "completed").length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-serif text-xl font-semibold mb-2">No Active Matches</h3>
                          <p className="text-muted-foreground mb-4">
                            All your matches are completed. Schedule a new match to get back on the court!
                          </p>
                          <Button onClick={() => setShowCreateMatch(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule New Match
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      matches
                        .filter((m) => m.status !== "completed")
                        .map((match) => (
                          <Card key={match.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                      {match.opponent
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold text-lg">{match.opponent}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <div className="flex items-center gap-1">
                                        <CalendarDays className="h-3 w-3" />
                                        {formatDate(match.date)}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {match.time}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                      <MapPin className="h-3 w-3" />
                                      {match.location}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                  <Badge
                                    variant={match.status === "in-progress" ? "default" : "outline"}
                                    className="capitalize"
                                  >
                                    {match.status.replace("-", " ")}
                                  </Badge>
                                  {match.score && (
                                    <div className="flex gap-1 flex-wrap">
                                      {match.score.split(',').map((set, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30 font-serif tracking-wider">
                                          {set.trim()}
                                        </Badge>
                                      ))}
                                      {getMatchCultureLabels(match.score).map((label, i) => (
                                        <Badge key={`label-${i}`} variant="default" className="text-xs bg-secondary text-primary font-serif tracking-wider border-primary/50">
                                          {label}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    {(match.status === "upcoming" || match.status === "in-progress") && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStartScoreTracking(match)}
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        {match.status === "upcoming" ? "Start" : "Continue"}
                                      </Button>
                                    )}
                                    {match.status === "upcoming" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setMatchToDelete(match)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {match.notes && (
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm text-muted-foreground">{match.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tournaments" className="space-y-6">
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">Tournament System</h3>
                  <p className="text-muted-foreground mb-4">
                    Create and manage tournaments with your tennis friends. Coming soon!
                  </p>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold">Performance Analytics</h2>
                </div>

                {matches.filter((m) => m.status === "completed").length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Trophy className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-serif text-xl font-semibold mb-2">No Analytics Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Complete some matches to see your performance analytics and insights.
                      </p>
                      <Button onClick={() => setShowCreateMatch(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Your First Match
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Performance Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Performance Overview</CardTitle>
                        <CardDescription>Your tennis performance at a glance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-1">{matchStats.wins}</div>
                            <div className="text-sm text-muted-foreground">Wins</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-red-600 mb-1">{matchStats.losses}</div>
                            <div className="text-sm text-muted-foreground">Losses</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-1">{matchStats.totalMatches}</div>
                            <div className="text-sm text-muted-foreground">Total Matches</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-1">{matchStats.winRate}%</div>
                            <div className="text-sm text-muted-foreground">Win Rate</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Insights */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">AI Insights & Recommendations</CardTitle>
                        <CardDescription>Personalized analysis of your tennis performance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const completedMatches = matches.filter((m) => m.status === "completed")
                          const recentMatches = completedMatches.slice(0, 5)
                          const insights = []

                          // Win rate analysis
                          if (matchStats.winRate >= 70) {
                            insights.push({
                              type: "positive",
                              title: "Excellent Performance",
                              description: `You're dominating with a ${matchStats.winRate}% win rate! Keep up the great work.`,
                              icon: "🏆",
                            })
                          } else if (matchStats.winRate >= 50) {
                            insights.push({
                              type: "neutral",
                              title: "Solid Performance",
                              description: `Your ${matchStats.winRate}% win rate shows consistent play. Focus on key improvements to reach the next level.`,
                              icon: "📈",
                            })
                          } else if (matchStats.winRate < 50 && completedMatches.length >= 3) {
                            insights.push({
                              type: "improvement",
                              title: "Growth Opportunity",
                              description: "Consider working on your serve and return game to improve your win rate.",
                              icon: "💪",
                            })
                          }

                          // Activity analysis
                          if (completedMatches.length >= 10) {
                            insights.push({
                              type: "positive",
                              title: "Active Player",
                              description: `You've completed ${completedMatches.length} matches! Your dedication is paying off.`,
                              icon: "🎾",
                            })
                          } else if (completedMatches.length >= 5) {
                            insights.push({
                              type: "neutral",
                              title: "Building Momentum",
                              description:
                                "You're developing a good playing rhythm. Try to maintain regular match frequency.",
                              icon: "⚡",
                            })
                          }

                          // Opponent diversity
                          const uniqueOpponents = new Set(completedMatches.map((m) => m.opponent)).size
                          if (uniqueOpponents >= 5) {
                            insights.push({
                              type: "positive",
                              title: "Diverse Competition",
                              description: `Playing against ${uniqueOpponents} different opponents helps improve your adaptability.`,
                              icon: "🌟",
                            })
                          }

                          return insights.length > 0 ? (
                            insights.map((insight, index) => (
                              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                                <div className="text-2xl">{insight.icon}</div>
                                <div>
                                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground">
                                Complete more matches to get personalized insights!
                              </p>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>

                    {/* Opponent Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Opponent Analysis</CardTitle>
                        <CardDescription>Your performance against different opponents</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const completedMatches = matches.filter((m) => m.status === "completed")
                          const opponentStats = completedMatches.reduce(
                            (acc, match) => {
                              const opponent = match.opponent
                              if (!acc[opponent]) {
                                acc[opponent] = { wins: 0, losses: 0, total: 0 }
                              }
                              acc[opponent].total++
                              // Simple win detection based on score containing "6-"
                              if (match.score && match.score.includes("6-")) {
                                acc[opponent].wins++
                              } else {
                                acc[opponent].losses++
                              }
                              return acc
                            },
                            {} as Record<string, { wins: number; losses: number; total: number }>,
                          )

                          const sortedOpponents = Object.entries(opponentStats)
                            .sort(([, a], [, b]) => b.total - a.total)
                            .slice(0, 5)

                          return sortedOpponents.length > 0 ? (
                            <div className="space-y-3">
                              {sortedOpponents.map(([opponent, stats]) => {
                                const winRate = Math.round((stats.wins / stats.total) * 100)
                                return (
                                  <div
                                    key={opponent}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                          {opponent
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-semibold">{opponent}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {stats.total} match{stats.total !== 1 ? "es" : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold">{winRate}%</div>
                                      <div className="text-sm text-muted-foreground">
                                        {stats.wins}W - {stats.losses}L
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground">No opponent data available yet.</p>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>

                    {/* Playing Patterns */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-serif">Playing Patterns</CardTitle>
                        <CardDescription>When and where you play best</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const completedMatches = matches.filter((m) => m.status === "completed")

                          // Analyze playing locations
                          const locationStats = completedMatches.reduce(
                            (acc, match) => {
                              const location = match.location
                              if (!acc[location]) {
                                acc[location] = { count: 0, wins: 0 }
                              }
                              acc[location].count++
                              if (match.score && match.score.includes("6-")) {
                                acc[location].wins++
                              }
                              return acc
                            },
                            {} as Record<string, { count: number; wins: number }>,
                          )

                          const topLocations = Object.entries(locationStats)
                            .sort(([, a], [, b]) => b.count - a.count)
                            .slice(0, 3)

                          return (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-3">Favorite Courts</h4>
                                {topLocations.length > 0 ? (
                                  <div className="space-y-2">
                                    {topLocations.map(([location, stats]) => {
                                      const winRate = Math.round((stats.wins / stats.count) * 100)
                                      return (
                                        <div
                                          key={location}
                                          className="flex items-center justify-between p-2 rounded bg-muted/30"
                                        >
                                          <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{location}</span>
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {stats.count} matches • {winRate}% win rate
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground text-sm">No location data available yet.</p>
                                )}
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Performance Insights</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                      Most Active
                                    </div>
                                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                      {topLocations[0] ? topLocations[0][0] : "No data"}
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                      Best Performance
                                    </div>
                                    <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                      {(() => {
                                        const bestLocation = topLocations.reduce(
                                          (best, [location, stats]) => {
                                            const winRate = stats.wins / stats.count
                                            const bestRate = best ? best.stats.wins / best.stats.count : 0
                                            return winRate > bestRate ? { location, stats } : best
                                          },
                                          null as { location: string; stats: { count: number; wins: number } } | null,
                                        )
                                        return bestLocation ? bestLocation.location : "No data"
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-card overflow-hidden">
              <div className="bg-primary/10 px-4 py-2 border-b border-primary/20 flex items-center justify-between">
                <span className="font-serif text-sm tracking-wider uppercase flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {currentUser.location || "Local Courts"}
                </span>
                <span className="text-xs text-muted-foreground">COURT WEATHER</span>
              </div>
              <CardContent className="p-4">
                {!weatherData.isLoaded ? (
                  <div className="animate-pulse flex space-x-4 items-center">
                    <div className="rounded-full bg-muted h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {weatherData.condition === "Sunny" ? (
                        <Sun className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                      ) : weatherData.condition.includes("Rain") ? (
                        <CloudRain className="h-8 w-8 text-blue-400" />
                      ) : (
                        <Cloud className="h-8 w-8 text-gray-400" />
                      )}
                      <div>
                        <p className="text-2xl font-serif font-bold">{weatherData.temp}°<span className="text-lg text-muted-foreground font-sans">F</span></p>
                        <p className="text-xs text-muted-foreground">{weatherData.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs font-serif tracking-widest ${
                          weatherData.playability === "Play ball" 
                            ? "bg-primary/20 text-primary border-primary/30" 
                            : weatherData.playability === "Rain delay"
                            ? "bg-destructive/20 text-destructive border-destructive/30"
                            : "bg-orange-500/20 text-orange-500 border-orange-500/30"
                        }`}
                      >
                        {weatherData.playability.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowCreateMatch(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Match
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    const upcomingMatch = matches.find((m) => m.status === "upcoming" || m.status === "in-progress")
                    if (upcomingMatch) {
                      handleStartScoreTracking(upcomingMatch)
                    }
                  }}
                  disabled={!matches.some((m) => m.status === "upcoming" || m.status === "in-progress")}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {matches.some((m) => m.status === "upcoming" || m.status === "in-progress") ? "Track Score" : "No Active Match to Track"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent hover:border-primary hover:text-primary transition-colors"
                  onClick={() => setShowFriendsManager(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Friends
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            <Card className="border-secondary/50 bg-secondary/10">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-lg">Weekly Challenge</CardTitle>
                <CardDescription className="text-foreground">{weeklyChallenge.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-bold">{weeklyChallenge.progress} / {weeklyChallenge.target}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${weeklyChallenge.completed ? 'bg-primary shadow-[0_0_10px_rgba(204,255,0,0.8)]' : 'bg-primary/60'}`} 
                    style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}
                  ></div>
                </div>
                {weeklyChallenge.completed && (
                  <p className="text-xs text-primary mt-2 font-serif tracking-wide uppercase text-center animate-pulse">Challenge Completed! Badge Awarded 🏆</p>
                )}
              </CardContent>
            </Card>

            {/* Find Players (Discovery) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-lg flex justify-between items-center">
                  Find Players
                  <Badge variant="outline" className="text-xs bg-secondary border-secondary/50 flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                    Nearby
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {discoveryPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{player.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm leading-none">{player.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{player.distance} • {player.winRate} win rate</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10">
                      Challenge
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {matches
                    .filter((m) => m.status === "completed")
                    .slice(0, 3)
                    .map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-border">
                        <p className="text-muted-foreground font-serif tracking-wide">
                          VS <span className="font-sans font-semibold text-foreground">{match.opponent}</span>
                        </p>
                        <div className="flex gap-1">
                          {match.score ? match.score.split(',').map((set, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
                              {set.trim()}
                            </Badge>
                          )) : (
                            <Badge variant="outline" className="text-xs">TBD</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  {matches.filter((m) => m.status === "completed").length === 0 && (
                    <p className="text-muted-foreground">No recent matches completed</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-[0_4px_20px_rgba(204,255,0,0.05)]">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif flex items-center justify-between">
                  My Game 
                  <Badge variant="outline" className="font-mono text-primary border-primary/30">
                    Est. UTR: {
                      currentUser?.skills && Object.values(currentUser.skills).some(v => v > 0)
                      ? (Object.values(currentUser.skills).reduce((a, b) => a + b, 0) / 4).toFixed(1)
                      : "N/A"
                    }
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                {(!currentUser?.skills || Object.values(currentUser.skills).every(v => v === 0)) ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground italic mb-2">No skill data available yet.</p>
                    <p className="text-xs text-primary/80">Add more matches to improve accuracy.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Serve</span>
                        <span className="font-mono">{currentUser.skills.serve}/10</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(currentUser.skills.serve / 10) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Forehand</span>
                        <span className="font-mono">{currentUser.skills.forehand}/10</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(currentUser.skills.forehand / 10) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Backhand</span>
                        <span className="font-mono">{currentUser.skills.backhand}/10</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(currentUser.skills.backhand / 10) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">Net Play</span>
                        <span className="font-mono">{currentUser.skills.netPlay}/10</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(currentUser.skills.netPlay / 10) * 100}%` }}></div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CreateMatchDialog open={showCreateMatch} onOpenChange={setShowCreateMatch} onCreateMatch={handleCreateMatch} />

      {activeMatch && (
        <ScoreTracker
          open={showScoreTracker}
          onOpenChange={setShowScoreTracker}
          matchId={activeMatch.id}
          player1Name={currentUser.name}
          player2Name={activeMatch.opponent}
          onSaveScore={handleSaveScore}
        />
      )}

      <FriendsManager open={showFriendsManager} onOpenChange={setShowFriendsManager} currentUserId={currentUser.id} />

      <AlertDialog open={!!matchToDelete} onOpenChange={(open) => !open && setMatchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Match?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your match with {matchToDelete?.opponent}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Match</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => matchToDelete && handleDeleteMatch(matchToDelete.id)}
            >
              Cancel Match
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
