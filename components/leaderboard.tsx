"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, TrendingUp, Flame, Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface LeaderboardEntry {
  id: string
  name: string
  avatar_url?: string
  wins: number
  losses: number
  winRate: number
  totalMatches: number
  currentStreak: number
}

interface LeaderboardProps {
  currentUserId: string
  sport: string
}

export function Leaderboard({ currentUserId, sport }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadLeaderboard()
  }, [sport])

  const loadLeaderboard = async () => {
    setIsLoading(true)
    try {
      // Get all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, avatar_url")

      if (!profiles) {
        setLeaderboard([])
        return
      }

      // Get matches for each profile to calculate stats
      const leaderboardData: LeaderboardEntry[] = []

      for (const profile of profiles) {
        const { data: matches } = await supabase
          .from("matches")
          .select("*")
          .eq("user_id", profile.id)
          .eq("sport", sport)
          .eq("status", "completed")

        if (matches && matches.length > 0) {
          const wins = matches.filter((m) => m.winner === profile.name || m.winner === "me").length
          const losses = matches.length - wins
          const winRate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0

          // Calculate current streak
          let currentStreak = 0
          const sortedMatches = [...matches].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          for (const match of sortedMatches) {
            if (match.winner === profile.name || match.winner === "me") {
              currentStreak++
            } else {
              break
            }
          }

          leaderboardData.push({
            id: profile.id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            wins,
            losses,
            winRate,
            totalMatches: matches.length,
            currentStreak,
          })
        }
      }

      setLeaderboard(leaderboardData)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortByWins = [...leaderboard].sort((a, b) => b.wins - a.wins)
  const sortByWinRate = [...leaderboard].sort((a, b) => b.winRate - a.winRate)
  const sortByStreak = [...leaderboard].sort((a, b) => b.currentStreak - a.currentStreak)
  const sortByMatches = [...leaderboard].sort((a, b) => b.totalMatches - a.totalMatches)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarSrc = (avatarUrl?: string) => {
    if (!avatarUrl) return undefined
    return `/api/avatar?pathname=${encodeURIComponent(avatarUrl)}`
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-mono w-5 text-center">{rank}</span>
    }
  }

  const LeaderboardList = ({ data, metric }: { data: LeaderboardEntry[]; metric: string }) => (
    <div className="space-y-2">
      {data.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No data yet. Play some matches!</p>
      ) : (
        data.slice(0, 10).map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              entry.id === currentUserId
                ? "bg-primary/20 border border-primary/50"
                : "bg-muted/30 hover:bg-muted/50"
            } transition-colors`}
          >
            <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={getAvatarSrc(entry.avatar_url)} alt={entry.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {getInitials(entry.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {entry.name}
                {entry.id === currentUserId && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    You
                  </Badge>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.wins}W - {entry.losses}L ({entry.winRate}%)
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary text-lg">
                {metric === "wins" && entry.wins}
                {metric === "winRate" && `${entry.winRate}%`}
                {metric === "streak" && entry.currentStreak}
                {metric === "matches" && entry.totalMatches}
              </p>
              <p className="text-xs text-muted-foreground">
                {metric === "wins" && "wins"}
                {metric === "winRate" && "win rate"}
                {metric === "streak" && "streak"}
                {metric === "matches" && "matches"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading leaderboard...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wins" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="wins" className="text-xs sm:text-sm">
              <Trophy className="h-4 w-4 mr-1 hidden sm:inline" />
              Wins
            </TabsTrigger>
            <TabsTrigger value="winRate" className="text-xs sm:text-sm">
              <Target className="h-4 w-4 mr-1 hidden sm:inline" />
              Win %
            </TabsTrigger>
            <TabsTrigger value="streak" className="text-xs sm:text-sm">
              <Flame className="h-4 w-4 mr-1 hidden sm:inline" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" />
              Active
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wins">
            <LeaderboardList data={sortByWins} metric="wins" />
          </TabsContent>
          <TabsContent value="winRate">
            <LeaderboardList data={sortByWinRate} metric="winRate" />
          </TabsContent>
          <TabsContent value="streak">
            <LeaderboardList data={sortByStreak} metric="streak" />
          </TabsContent>
          <TabsContent value="matches">
            <LeaderboardList data={sortByMatches} metric="matches" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
