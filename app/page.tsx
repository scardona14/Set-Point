"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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

interface Tournament {
  id: string
  name: string
  type: "single-elimination" | "double-elimination" | "round-robin"
  status: "upcoming" | "active" | "completed"
  participants: string[]
  startDate: string
  prize?: string
  entryFee?: number
  description?: string
  maxParticipants?: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  unlockedAt?: string
  category: "matches" | "social" | "performance" | "tournaments"
}

interface Friend {
  id: string
  name: string
  email: string
  skillLevel: string
  matchesPlayed: number
  winRate: number
  status: "active" | "pending" | "invited"
}

interface Notification {
  id: string
  type: "match_reminder" | "friend_request" | "tournament" | "achievement" | "social"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

interface InvitationData {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserEmail: string
  toEmail: string
  message: string
  createdAt: string
  status: "pending" | "accepted" | "expired"
}

const USERS_STORAGE_KEY = "setpoint_users"
const CURRENT_USER_KEY = "setpoint_current_user"
const INVITATIONS_STORAGE_KEY = "setpoint_invitations"

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

const getAllInvitations = (): InvitationData[] => {
  if (typeof window === "undefined") return []
  const invitations = localStorage.getItem(INVITATIONS_STORAGE_KEY)
  return invitations ? JSON.parse(invitations) : []
}

const saveInvitation = (invitation: InvitationData) => {
  if (typeof window === "undefined") return
  const invitations = getAllInvitations()
  invitations.push(invitation)
  localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invitations))
}

const updateInvitationStatus = (invitationId: string, status: "accepted" | "expired") => {
  if (typeof window === "undefined") return
  const invitations = getAllInvitations()
  const updatedInvitations = invitations.map((inv) => (inv.id === invitationId ? { ...inv, status } : inv))
  localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(updatedInvitations))
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
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [authError, setAuthError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<"dashboard" | "tournaments" | "analytics" | "social" | "performance">(
    "dashboard",
  )
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [showScoreTracker, setShowScoreTracker] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showEmailInvite, setShowEmailInvite] = useState(false)
  const [showCreateTournament, setShowCreateTournament] = useState(false)
  const [trackingMatchId, setTrackingMatchId] = useState<string | null>(null)
  const [matchForm, setMatchForm] = useState({
    opponent: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  })
  const [emailInviteForm, setEmailInviteForm] = useState({
    email: "",
    message: "",
  })
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    type: "single-elimination" as const,
    startDate: "",
    prize: "",
    entryFee: "",
    description: "",
    maxParticipants: "8",
  })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showInviteAcceptance, setShowInviteAcceptance] = useState(false)
  const [currentInvitation, setCurrentInvitation] = useState<InvitationData | null>(null)

  useEffect(() => {
    if (currentUser) {
      // Initialize achievements
      const defaultAchievements: Achievement[] = [
        {
          id: "first_match",
          title: "First Match",
          description: "Played your first tennis match",
          icon: "🎾",
          rarity: "common",
          category: "matches",
          unlockedAt: matches.length > 0 ? new Date().toISOString() : undefined,
        },
        {
          id: "social_butterfly",
          title: "Social Butterfly",
          description: "Added 5 tennis friends",
          icon: "🦋",
          rarity: "rare",
          category: "social",
          unlockedAt: friends.length >= 5 ? new Date().toISOString() : undefined,
        },
        {
          id: "tournament_winner",
          title: "Tournament Champion",
          description: "Won your first tournament",
          icon: "🏆",
          rarity: "epic",
          category: "tournaments",
        },
        {
          id: "perfect_week",
          title: "Perfect Week",
          description: "Won all matches in a week",
          icon: "⭐",
          rarity: "legendary",
          category: "performance",
        },
      ]
      setAchievements(defaultAchievements)

      // Sample tournaments
      const sampleTournaments: Tournament[] = [
        {
          id: "summer_open",
          name: "Summer Open 2024",
          type: "single-elimination",
          status: "upcoming",
          participants: ["John Doe", "Jane Smith", "Mike Johnson"],
          startDate: "2024-07-15",
          prize: "$500 Winner Takes All",
          entryFee: 25,
          description: "Annual summer tennis tournament",
          maxParticipants: 16,
        },
      ]
      setTournaments(sampleTournaments)
    }
  }, [currentUser, matches.length, friends.length])

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

  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const invitationId = urlParams.get("invitation")

    if (invitationId && !currentUser) {
      const invitations = getAllInvitations()
      const invitation = invitations.find((inv) => inv.id === invitationId && inv.status === "pending")

      if (invitation) {
        setCurrentInvitation(invitation)
        setShowInviteAcceptance(true)
      }
    }
  }, [currentUser])

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

  const handleCreateMatch = (matchData: any) => {
    const newMatch: Match = {
      id: Date.now().toString(),
      ...matchData,
      status: "upcoming" as const,
    }

    const updatedMatches = [...matches, newMatch]
    setMatches(updatedMatches)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      saveUserData(currentUser.id, { ...userData, matches: updatedMatches })
    }

    setShowCreateMatch(false)
  }

  const handleStartScoreTracking = (matchId: string) => {
    setTrackingMatchId(matchId)
    setShowScoreTracker(true)
  }

  const handleSaveScore = (matchId: string, finalScore: string, winner: string) => {
    const updatedMatches = matches.map((match) =>
      match.id === matchId ? { ...match, status: "completed" as const, score: finalScore } : match,
    )
    setMatches(updatedMatches)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      saveUserData(currentUser.id, { ...userData, matches: updatedMatches })
    }

    setShowScoreTracker(false)
    setTrackingMatchId(null)
  }

  const handleCreateMatchInline = (e: React.FormEvent) => {
    e.preventDefault()
    if (!matchForm.opponent || !matchForm.date || !matchForm.time || !matchForm.location) {
      return
    }

    const newMatch: Match = {
      id: Date.now().toString(),
      opponent: matchForm.opponent,
      date: matchForm.date,
      time: matchForm.time,
      location: matchForm.location,
      notes: matchForm.notes,
      status: "upcoming" as const,
    }

    const updatedMatches = [...matches, newMatch]
    setMatches(updatedMatches)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      saveUserData(currentUser.id, { ...userData, matches: updatedMatches })
    }

    setShowCreateMatch(false)
    setMatchForm({ opponent: "", date: "", time: "", location: "", notes: "" })
  }

  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInviteForm.email || !currentUser) return

    const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const invitation: InvitationData = {
      id: invitationId,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserEmail: currentUser.email,
      toEmail: emailInviteForm.email,
      message: emailInviteForm.message || `${currentUser.name} wants to connect with you on Set Point!`,
      createdAt: new Date().toISOString(),
      status: "pending",
    }

    saveInvitation(invitation)

    const invitationLink = `${window.location.origin}?invitation=${invitationId}`

    console.log(`[v0] Email invitation sent to ${emailInviteForm.email}`)
    console.log(`[v0] Invitation link: ${invitationLink}`)

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "friend_request",
      title: "Friend Invitation Sent",
      message: `Invitation sent to ${emailInviteForm.email}. They can accept at: ${invitationLink}`,
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])
    setShowEmailInvite(false)
    setEmailInviteForm({ email: "", message: "" })

    alert(`Invitation sent! Share this link with your friend: ${invitationLink}`)
  }

  const handleAcceptInvitation = () => {
    if (!currentInvitation) return

    updateInvitationStatus(currentInvitation.id, "accepted")

    setShowInviteAcceptance(false)
    setIsSignUp(true)
    setCurrentInvitation(null)

    window.history.replaceState({}, document.title, window.location.pathname)
  }

  const handleDeclineInvitation = () => {
    if (!currentInvitation) return

    updateInvitationStatus(currentInvitation.id, "expired")

    setShowInviteAcceptance(false)
    setCurrentInvitation(null)

    window.history.replaceState({}, document.title, window.location.pathname)
  }

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tournamentForm.name || !tournamentForm.startDate) return

    const newTournament: Tournament = {
      id: Date.now().toString(),
      name: tournamentForm.name,
      type: tournamentForm.type,
      status: "upcoming",
      participants: [currentUser?.name || ""],
      startDate: tournamentForm.startDate,
      prize: tournamentForm.prize,
      entryFee: tournamentForm.entryFee ? Number.parseInt(tournamentForm.entryFee) : undefined,
      description: tournamentForm.description,
      maxParticipants: Number.parseInt(tournamentForm.maxParticipants),
    }

    setTournaments((prev) => [...prev, newTournament])
    setShowCreateTournament(false)
    setTournamentForm({
      name: "",
      type: "single-elimination",
      startDate: "",
      prize: "",
      entryFee: "",
      description: "",
      maxParticipants: "8",
    })
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <span className="text-2xl">🎾</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
            <p className="text-xs text-muted-foreground">All time matches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <span className="text-2xl">🏆</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matches.length > 0
                ? Math.round(
                    (matches.filter((m) => m.status === "completed" && m.score?.includes("Won")).length /
                      matches.filter((m) => m.status === "completed").length) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Match win percentage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friends</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{friends.length}</div>
            <p className="text-xs text-muted-foreground">Tennis partners</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your tennis activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShowCreateMatch(true)} className="w-full">
              ➕ Schedule New Match
            </Button>
            <Button variant="outline" onClick={() => setShowFriends(true)} className="w-full">
              👥 Manage Friends
            </Button>
            <Button variant="outline" onClick={() => setActiveView("tournaments")} className="w-full">
              🏆 Join Tournament
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest tennis activities</CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No matches yet!</p>
                <Button onClick={() => setShowCreateMatch(true)}>Schedule Your First Match</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.slice(0, 3).map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">vs {match.opponent}</p>
                      <p className="text-sm text-muted-foreground">
                        {match.date} at {match.time}
                      </p>
                    </div>
                    <Badge variant={match.status === "completed" ? "default" : "secondary"}>{match.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center p-4">
        {showInviteAcceptance && currentInvitation && (
          <Card className="w-full max-w-md mb-4">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-cyan-900">🎾 Tennis Invitation</CardTitle>
              <CardDescription>You've been invited to join Set Point!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="font-medium">{currentInvitation.fromUserName}</p>
                <p className="text-sm text-muted-foreground">{currentInvitation.fromUserEmail}</p>
                <p className="text-sm mt-2">{currentInvitation.message}</p>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAcceptInvitation} className="flex-1">
                  Accept & Join
                </Button>
                <Button variant="outline" onClick={handleDeclineInvitation} className="flex-1 bg-transparent">
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Image src="/tennis-ball-realistic.png" alt="Set Point Logo" width={80} height={80} className="mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-cyan-900">Set Point</CardTitle>
            <CardDescription>Your ultimate tennis organizer</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={isSignUp ? "signup" : "signin"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      defaultValue={currentInvitation?.toEmail || ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Enter your password" required />
                  </div>
                  {authError && (
                    <Alert>
                      <AlertDescription>{authError}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="Enter your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      defaultValue={currentInvitation?.toEmail || ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      required
                      minLength={6}
                    />
                  </div>
                  {authError && (
                    <Alert>
                      <AlertDescription>{authError}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
      <header className="bg-white border-b border-cyan-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/tennis-ball-realistic.png" alt="Set Point Logo" width={40} height={40} />
            <h1 className="text-xl font-bold text-cyan-900">Set Point</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              🔔 {notifications.length > 0 && <Badge className="ml-1">{notifications.length}</Badge>}
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                🚪 Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="tournaments">🏆 Tournaments</TabsTrigger>
            <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
            <TabsTrigger value="social">👥 Social</TabsTrigger>
            <TabsTrigger value="performance">🎯 Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">{renderDashboard()}</TabsContent>

          <TabsContent value="tournaments">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Tournament System</CardTitle>
                <CardDescription>Create and join tennis tournaments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Tournament features coming soon!</p>
                <Button>Create Tournament</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>📈 Advanced Analytics</CardTitle>
                <CardDescription>Track your tennis performance and improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Analytics dashboard coming soon!</p>
                <Button>View Analytics</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>👥 Social Hub</CardTitle>
                <CardDescription>Connect with friends and share achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button onClick={() => setShowEmailInvite(true)} className="flex-1">
                    📧 Invite Friend by Email
                  </Button>
                  <Button variant="outline" onClick={() => setShowFriends(true)} className="flex-1">
                    👥 Manage Friends
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Recent Invitations</h3>
                  {getAllInvitations()
                    .filter((inv) => inv.fromUserId === currentUser?.id)
                    .slice(0, 3)
                    .map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium">{invitation.toEmail}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(invitation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={invitation.status === "accepted" ? "default" : "secondary"}>
                          {invitation.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Performance Tracking</CardTitle>
                <CardDescription>Detailed performance metrics and coaching insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Performance tracking coming soon!</p>
                <Button>Track Performance</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {showCreateMatch && (
        <Dialog open={showCreateMatch} onOpenChange={setShowCreateMatch}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Match</DialogTitle>
              <DialogDescription>Create a new tennis match with a friend</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input id="opponent" placeholder="Enter opponent's name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Tennis court location" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Any additional notes..." />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateMatch(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule Match</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {showEmailInvite && (
        <Dialog open={showEmailInvite} onOpenChange={setShowEmailInvite}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>📧 Invite Friend to Set Point</DialogTitle>
              <DialogDescription>Send a tennis invitation to your friend</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendEmailInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Friend's Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="Enter your friend's email"
                  value={emailInviteForm.email}
                  onChange={(e) => setEmailInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
                <Textarea
                  id="inviteMessage"
                  placeholder="Add a personal message to your invitation..."
                  value={emailInviteForm.message}
                  onChange={(e) => setEmailInviteForm((prev) => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowEmailInvite(false)}>
                  Cancel
                </Button>
                <Button type="submit">Send Invitation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
