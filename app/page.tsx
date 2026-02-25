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
import { CalendarDays, Users, Trophy, Plus, MapPin, Clock, Play, Trash2 } from "lucide-react"
import { TournamentManager } from "@/components/tournament-manager"
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

type Sport = "tennis" | "pickleball" | "padel"

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
  sport: Sport
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
  const [selectedSport, setSelectedSport] = useState<Sport>("tennis")
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

  const handleCreateMatch = (matchData: Omit<Match, "id" | "status" | "sport">) => {
    const newMatch: Match = {
      ...matchData,
      id: Date.now().toString(),
      status: "upcoming",
      sport: selectedSport,
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
        sport: selectedSport,
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

  const sportMatches = matches.filter((m) => m.sport === selectedSport)

  const getMatchStats = () => {
    const completedMatches = sportMatches.filter((m) => m.status === "completed")
    const wins = completedMatches.filter((m) => m.winner === "player1").length
    const losses = completedMatches.length - wins
    const winRate = completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0

    return { wins, losses, winRate, totalMatches: completedMatches.length }
  }

  const matchStats = getMatchStats()

  const sportLabels: Record<Sport, { name: string; icon: string }> = {
    tennis: { name: "Tennis", icon: "🎾" },
    pickleball: { name: "Pickleball", icon: "🏓" },
    padel: { name: "Padel", icon: "🎾" },
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
              Your ultimate racket sports organizer - tennis, pickleball, and padel. Organize matches, track scores, and
              stay connected.
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
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-1">
              {(["tennis", "pickleball", "padel"] as Sport[]).map((sport) => (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedSport === sport
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{sportLabels[sport].icon}</span>
                  <span className="hidden sm:inline">{sportLabels[sport].name}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter
                currentUserId={currentUser.id}
                onFriendRequestAction={handleFriendRequestAction}
                onMatchInvitationAction={handleMatchInvitationAction}
              />
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
                  <p className="text-2xl font-bold">{sportMatches.filter((m) => m.status === "upcoming").length}</p>
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
                  <p className="text-sm text-muted-foreground">Friends</p>
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
                  <p className="text-2xl font-bold">{sportMatches.filter((m) => m.status === "completed").length}</p>
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
                  <p className="text-2xl font-bold">{matchStats.winRate}%</p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

                {sportMatches.length === 0 && !showMatchHistory ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                        <Image
                          src="/tennis-ball-realistic.png"
                          alt="Set Point"
                          width={64}
                          height={64}
                          className="rounded-full"
                        />
                      </div>
                      <h3 className="font-serif text-xl font-semibold mb-2">Welcome to Set Point!</h3>
                      <p className="text-muted-foreground mb-4">
                        Ready to organize your first {sportLabels[selectedSport].name.toLowerCase()} match? Click "New
                        Match" to get started.
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

                    {sportMatches.filter((m) => m.status === "completed").length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No completed {sportLabels[selectedSport].name.toLowerCase()} matches yet. Start playing to
                            build your history!
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {sportMatches
                          .filter((m) => m.status === "completed")
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
                                      <p className="text-lg font-mono font-semibold text-primary">{match.score}</p>
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
                    {sportMatches.filter((m) => m.status !== "completed").length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="font-serif text-xl font-semibold mb-2">No Active Matches</h3>
                          <p className="text-muted-foreground mb-4">
                            All your {sportLabels[selectedSport].name.toLowerCase()} matches are completed. Schedule a
                            new match!
                          </p>
                          <Button onClick={() => setShowCreateMatch(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule New Match
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      sportMatches
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
                                  {match.score && <p className="text-sm font-mono font-semibold">{match.score}</p>}
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
                <TournamentManager sport={selectedSport} currentUser={currentUser} />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold">Performance Analytics</h2>
                </div>

                {sportMatches.filter((m) => m.status === "completed").length === 0 ? (
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
                        <CardDescription>Your {sportLabels[selectedSport].name.toLowerCase()} performance at a glance</CardDescription>
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
                        <CardDescription>Personalized analysis of your {sportLabels[selectedSport].name.toLowerCase()} performance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {(() => {
                          const completedMatches = sportMatches.filter((m) => m.status === "completed")
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
                          const completedMatches = sportMatches.filter((m) => m.status === "completed")
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
                          const completedMatches = sportMatches.filter((m) => m.status === "completed")

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
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    const upcomingMatch = sportMatches.find((m) => m.status === "upcoming" || m.status === "in-progress")
                    if (upcomingMatch) {
                      handleStartScoreTracking(upcomingMatch)
                    }
                  }}
                  disabled={!sportMatches.some((m) => m.status === "upcoming" || m.status === "in-progress")}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Track Score
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowFriendsManager(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Friends
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {sportMatches
                    .filter((m) => m.status === "completed")
                    .slice(0, 3)
                    .map((match, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <p className="text-muted-foreground">
                          vs <span className="font-semibold">{match.opponent}</span>
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {match.score}
                        </Badge>
                      </div>
                    ))}
                  {sportMatches.filter((m) => m.status === "completed").length === 0 && (
                    <p className="text-muted-foreground">No recent matches completed</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CreateMatchDialog open={showCreateMatch} onOpenChange={setShowCreateMatch} onCreateMatch={handleCreateMatch} sport={selectedSport} />

      {activeMatch && (
        <ScoreTracker
          open={showScoreTracker}
          onOpenChange={setShowScoreTracker}
          matchId={activeMatch.id}
          player1Name={currentUser.name}
          player2Name={activeMatch.opponent}
          onSaveScore={handleSaveScore}
          sport={selectedSport}
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
