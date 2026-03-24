"use client"

import { useState, useEffect } from "react";
import { User, Calendar, Trophy, ChevronRight, CheckCircle2, MapPin, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { SportIcon, type SportType } from "@/components/SportIcon";

const SPORT_COLORS: Record<SportType, { border: string; bg: string; text: string }> = {
  "Padel":        { border: "border-l-[#BFFF00]", bg: "bg-[#BFFF00]/10",  text: "text-[#BFFF00]"  },
  "Tennis":       { border: "border-l-[#FFE600]", bg: "bg-[#FFE600]/10",  text: "text-[#FFE600]"  },
  "Pickleball":   { border: "border-l-[#00CFFF]", bg: "bg-[#00CFFF]/10",  text: "text-[#00CFFF]"  },
  "Beach Tennis": { border: "border-l-[#FF6B35]", bg: "bg-[#FF6B35]/10",  text: "text-[#FF6B35]"  },
};

const MOCK_GUERRILLA = [
  {
    id: "g1",
    sport: "Padel" as SportType,
    locationName: "Miramar Paddle Club",
    distance: "0.8 km",
    playersJoined: 3,
    totalSlots: 4,
    timeRemaining: "Starts in 22 min",
    players: ["DR", "CM", "JL"],
    court: "Court 3",
  },
  {
    id: "g2",
    sport: "Pickleball" as SportType,
    locationName: "Parque Central",
    distance: "1.2 km",
    playersJoined: 2,
    totalSlots: 4,
    timeRemaining: "Starts in 45 min",
    players: ["MR", "AV"],
    court: "Court 1",
  },
  {
    id: "g3",
    sport: "Tennis" as SportType,
    locationName: "Club Náutico",
    distance: "2.4 km",
    playersJoined: 1,
    totalSlots: 2,
    timeRemaining: "Starts in 1h 10min",
    players: ["PG"],
    court: "Court 5",
  },
];

<<<<<<< HEAD
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
=======
const MOCK_SCHEDULED = [
>>>>>>> 050bfbf (feat: finalize tournament organizer and home dashboard)
  {
    id: "m1",
    sport: "Padel" as SportType,
    opponent: "Diego Ramos",
    date: "Today",
    time: "6:00 PM",
    court: "Court 2",
    location: "Miramar Paddle Club",
  },
  {
    id: "m2",
    sport: "Tennis" as SportType,
    opponent: "Carlos Rivera",
    date: "Tomorrow",
    time: "8:30 AM",
    court: "Court 1",
    location: "Parque Central",
  },
];
>>>>>>> 1e8b8b9 (Editing the app - guerrilla)

function LivePulse() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
    </span>
  );
}

function PlayerAvatars({ initials }: { initials: string[] }) {
  return (
    <div className="flex -space-x-2">
      {initials.map((init, i) => (
        <div
          key={i}
          className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-foreground"
        >
          {init}
        </div>
      ))}
    </div>
  );
}

function SlotBar({ filled, total }: { filled: number; total: number }) {
  const pct = (filled / total) * 100;
  const urgent = pct >= 75;
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${urgent ? "bg-primary" : "bg-muted-foreground/40"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function HomePage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const activePlayers = 12 + (tick % 3);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-mono text-2xl font-black text-primary tracking-tighter italic">
            SET<span className="text-foreground">POINT</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-full">
              <LivePulse />
              <span className="font-semibold text-foreground">{activePlayers}</span>
              <span>playing now</span>
            </div>
            <div className="h-9 w-9 bg-muted rounded-full flex items-center justify-center border border-border">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 flex flex-col gap-8">

        {/* HERO: Open Games */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary fill-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Near You</span>
              </div>
              <h2 className="text-2xl font-black text-foreground leading-none">Open Games</h2>
            </div>
            <Link
              href="/book"
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5"
            >
              See all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_GUERRILLA.map((game) => {
              const colors = SPORT_COLORS[game.sport];
              const isFull = game.playersJoined >= game.totalSlots;
              const spotsLeft = game.totalSlots - game.playersJoined;
              return (
                <div
                  key={game.id}
                  className={`bg-card border border-border border-l-4 ${colors.border} rounded-xl p-4 flex flex-col gap-3 shadow-sm`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`${colors.bg} p-2 rounded-lg`}>
                        <SportIcon sport={game.sport} className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-tight">{game.sport}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {game.locationName} · {game.distance}
                        </p>
                      </div>
                    </div>
                    <div className={`${colors.bg} ${colors.text} text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap`}>
                      {game.court}
                    </div>
                  </div>

                  {/* Slot fill bar */}
                  <SlotBar filled={game.playersJoined} total={game.totalSlots} />

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlayerAvatars initials={game.players} />
                      <span className="text-xs text-muted-foreground">
                        {isFull ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium flex items-center gap-1 ${colors.text}`}>
                        <Clock className="h-3 w-3" />
                        {game.timeRemaining}
                      </span>
                      <button
                        disabled={isFull}
                        className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all active:scale-95 ${
                          isFull
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_14px_rgba(191,255,0,0.4)]"
                        }`}
                      >
                        {isFull ? "Full" : "Join Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/tournament"
            className="bg-card border border-border hover:border-primary/50 transition-all p-5 rounded-2xl flex flex-col gap-3 group hover:shadow-[0_0_20px_rgba(191,255,0,0.08)]"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Tournament</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Setup Draw</p>
            </div>
          </Link>
          <Link
            href="/book"
            className="bg-card border border-border hover:border-secondary/50 transition-all p-5 rounded-2xl flex flex-col gap-3 group hover:shadow-[0_0_20px_rgba(255,230,0,0.08)]"
          >
            <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Schedule</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Book Court</p>
            </div>
          </Link>
        </section>

        {/* My Matches */}
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground">My Matches</h2>
            <p className="text-sm text-muted-foreground">Your upcoming schedule</p>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_SCHEDULED.map((match) => {
              const colors = SPORT_COLORS[match.sport];
              return (
                <div
                  key={match.id}
                  className={`bg-card border border-border border-l-4 ${colors.border} rounded-xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden`}
                >
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`${colors.bg} p-1.5 rounded-md`}>
                      <SportIcon sport={match.sport} className={`h-4 w-4 ${colors.text}`} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                      {match.date} · {match.time}
                    </span>
                  </div>
                  <p className="text-lg font-black text-foreground leading-none">vs. {match.opponent}</p>
                  <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                    <span className="text-muted-foreground font-medium text-xs">{match.location}</span>
                    <span className="bg-muted px-2 py-1 rounded-lg font-bold text-xs text-foreground">
                      {match.court}
                    </span>
                  </div>
                </div>
              );
            })}
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
