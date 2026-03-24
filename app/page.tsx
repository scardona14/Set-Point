import { User } from "lucide-react";
import { GuerrillaCard } from "@/components/GuerrillaCard";
import type { SportType } from "@/components/SportIcon";
import Link from "next/link";

<<<<<<< HEAD
import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function TennisMatchOrganizer() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedSport, setSelectedSport] = useState<Sport>("tennis")
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [showScoreTracker, setShowScoreTracker] = useState(false)
  const [showFriendsManager, setShowFriendsManager] = useState(false)
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [showMatchHistory, setShowMatchHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // New Feature States
  const [discoveryPlayers] = useState([
    { id: "1", name: "Carlos R.", distance: "2.1 mi", winRate: "68%", avatar: "CR" },
    { id: "2", name: "Maria V.", distance: "3.5 mi", winRate: "54%", avatar: "MV" },
    { id: "3", name: "David S.", distance: "5.0 mi", winRate: "72%", avatar: "DS" }
  ])

  // Fetch matches from Supabase
  const fetchMatches = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setMatches(
        data.map((m: Record<string, unknown>) => ({
          id: m.id as string,
          opponent: m.opponent as string,
          date: m.date as string,
          time: m.time as string,
          location: m.location as string,
          status: m.status as "upcoming" | "completed" | "in-progress",
          score: m.score as string | undefined,
          notes: m.notes as string | undefined,
          matchFormat: m.match_format as "singles" | "doubles" | undefined,
          doublesPartner: m.doubles_partner as string | undefined,
          winner: m.winner as string | undefined,
          sport: m.sport as Sport,
        }))
      )
    }
  }, [supabase])

  // Load user session and data from Supabase
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get profile from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      const appUser: User = {
        id: user.id,
        name: profile?.display_name || user.user_metadata?.display_name || "Player",
        email: user.email || "",
        skillLevel: profile?.skill_level || "intermediate",
        bio: profile?.bio || "",
        location: profile?.location || "",
        joinDate: new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      }

      setCurrentUser(appUser)
      await fetchMatches(user.id)
      setIsLoading(false)
    }

    loadUser()
  }, [router, supabase, fetchMatches])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleUpdateProfile = async (updatedUser: User) => {
    setCurrentUser(updatedUser)
    await supabase
      .from("profiles")
      .update({
        display_name: updatedUser.name,
        skill_level: updatedUser.skillLevel,
        bio: updatedUser.bio,
        location: updatedUser.location,
      })
      .eq("id", updatedUser.id)
  }

  const handleCreateMatch = async (matchData: Omit<Match, "id" | "status" | "sport">) => {
    if (!currentUser) return

    const { data, error } = await supabase
      .from("matches")
      .insert({
        user_id: currentUser.id,
        opponent: matchData.opponent,
        date: matchData.date,
        time: matchData.time,
        location: matchData.location,
        status: "upcoming",
        sport: selectedSport,
        match_format: matchData.matchFormat || "singles",
        doubles_partner: matchData.doublesPartner || null,
        notes: matchData.notes || null,
      })
      .select()
      .single()

    if (!error && data) {
      const newMatch: Match = {
        id: data.id,
        opponent: data.opponent,
        date: data.date,
        time: data.time,
        location: data.location,
        status: data.status,
        sport: data.sport,
        matchFormat: data.match_format,
        doublesPartner: data.doubles_partner,
        notes: data.notes,
      }
      setMatches((prev) => [newMatch, ...prev])
    }
  }

  const handleStartScoreTracking = async (match: Match) => {
    setActiveMatch(match)
    setShowScoreTracker(true)
    const updatedMatches = matches.map((m) => (m.id === match.id ? { ...m, status: "in-progress" as const } : m))
    setMatches(updatedMatches)

    await supabase
      .from("matches")
      .update({ status: "in-progress" })
      .eq("id", match.id)
  }

  const handleSaveScore = async (matchId: string, finalScore: string, winner: string) => {
    const updatedMatches = matches.map((match) =>
      match.id === matchId ? { ...match, status: "completed" as const, score: finalScore, winner } : match,
    )
    setMatches(updatedMatches)
    setActiveMatch(null)

    await supabase
      .from("matches")
      .update({ status: "completed", score: finalScore, winner })
      .eq("id", matchId)
  }

  const handleFriendRequestAction = (notificationId: string, action: "accept" | "reject") => {
    console.log(`Friend request ${notificationId} ${action}ed`)
  }

  const handleMatchInvitationAction = (notificationId: string, action: "accept" | "reject") => {
    console.log(`Match invitation ${notificationId} ${action}ed`)
  }

  const handleDeleteMatch = async (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId))
    setMatchToDelete(null)

    await supabase
      .from("matches")
      .delete()
      .eq("id", matchId)
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

    // Calculate win streak (consecutive wins from most recent matches)
    const sortedMatches = [...completedMatches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let winStreak = 0
    for (const match of sortedMatches) {
      if (match.winner === "player1") {
        winStreak++
      } else {
        break
      }
    }

    return { wins, losses, winRate, totalMatches: completedMatches.length, winStreak }
  }

  const matchStats = getMatchStats()
  const { winStreak } = matchStats

  const sportLabels: Record<Sport, { name: string; abbr: string }> = {
    tennis: { name: "Tennis", abbr: "TEN" },
    pickleball: { name: "Pickleball", abbr: "PKL" },
    padel: { name: "Padel", abbr: "PDL" },
  }

  // Show a loading state while the guest user is being created
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Image src="/app-icon.png" alt="Set Point Logo" width={64} height={64} className="mx-auto rounded-lg animate-pulse" />
          <p className="text-muted-foreground">Loading Set Point...</p>
        </div>
      </div>
    )
  }
=======
const MOCK_GAMES = [
  {
    id: "g1",
    sport: "Padel" as SportType,
    locationName: "Miramar Paddle Club",
    distance: "0.8 mi away",
    playersJoined: 3,
    totalSlots: 4,
    timeRemaining: "Starts in 22 min",
  },
  {
    id: "g2",
    sport: "Tennis" as SportType,
    locationName: "Parque Central",
    distance: "1.5 mi away",
    playersJoined: 2,
    totalSlots: 4,
    timeRemaining: "Starts in 45 min",
  },
  {
    id: "g3",
    sport: "Beach Tennis" as SportType,
    locationName: "Condado Beach Courts",
    distance: "2.1 mi away",
    playersJoined: 4,
    totalSlots: 4,
    timeRemaining: "Starts in 1 hr",
  },
  {
    id: "g4",
    sport: "Pickleball" as SportType,
    locationName: "Parque Luis A. Ferré",
    distance: "0.2 mi away",
    playersJoined: 1,
    totalSlots: 4,
    timeRemaining: "Starts in 2 hrs",
  },
];
>>>>>>> 1e8b8b9 (Editing the app - guerrilla)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-mono text-2xl font-black text-primary tracking-tighter italic">
            SET<span className="text-foreground">POINT</span>
          </h1>
          <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center border border-border overflow-hidden">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-8">
        {/* Hero CTA */}
        <section>
          <Link href="/book" className="block w-full">
            <div className="bg-primary hover:bg-primary/90 transition-colors rounded-2xl p-6 text-primary-foreground shadow-[0_0_30px_rgba(191,255,0,0.15)] flex flex-col items-center justify-center gap-2 group active:scale-[0.98]">
              <span className="text-3xl group-hover:-translate-y-1 transition-transform">📍</span>
              <h2 className="text-xl font-black text-center uppercase tracking-tight">
                Find a Game Near Me
              </h2>
              <p className="text-sm font-medium opacity-80">
                Last Minute Guerrilla
              </p>
            </div>
          </Link>
          <div className="mt-4 flex justify-center">
            <Link href="/tournament" className="text-sm font-bold text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border transition-colors">
              View Tournament Brackets
            </Link>
          </div>
        </section>

        {/* Feed */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔥</span>
            <h2 className="text-lg font-black text-foreground">Live Games Near You</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {MOCK_GAMES.map((game) => (
              <GuerrillaCard key={game.id} {...game} />
            ))}
          </div>
        </section>
      </main>
<<<<<<< HEAD

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

      <FriendsManager open={showFriendsManager} onOpenChange={setShowFriendsManager} currentUserId={currentUser.id} currentUserEmail={currentUser.email} />

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
=======
>>>>>>> 1e8b8b9 (Editing the app - guerrilla)
    </div>
  );
}
