"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, TrendingUp, Calendar, MapPin, Users, Flame } from "lucide-react"

interface Match {
  id: string
  opponent: string
  date: string
  time: string
  location: string
  status: "upcoming" | "completed" | "in-progress"
  score?: string
  winner?: string
  sport: string
}

interface StatsProps {
  matches: Match[]
  userName: string
}

export function StatsDashboard({ matches, userName }: StatsProps) {
  const completedMatches = matches.filter(m => m.status === "completed")
  const wins = completedMatches.filter(m => m.winner === "player1").length
  const losses = completedMatches.filter(m => m.winner === "player2").length
  const winRate = completedMatches.length > 0 ? Math.round((wins / completedMatches.length) * 100) : 0

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0
    let streakType: "win" | "loss" | null = null
    
    const sortedMatches = [...completedMatches].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    for (const match of sortedMatches) {
      const isWin = match.winner === "player1"
      if (streakType === null) {
        streakType = isWin ? "win" : "loss"
        streak = 1
      } else if ((isWin && streakType === "win") || (!isWin && streakType === "loss")) {
        streak++
      } else {
        break
      }
    }
    
    return { streak, type: streakType }
  }

  const currentStreak = calculateStreak()

  // Most played opponent
  const opponentCounts = completedMatches.reduce((acc, match) => {
    acc[match.opponent] = (acc[match.opponent] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostPlayedOpponent = Object.entries(opponentCounts).sort((a, b) => b[1] - a[1])[0]

  // Most played location
  const locationCounts = completedMatches.reduce((acc, match) => {
    acc[match.location] = (acc[match.location] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const favoriteLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]

  // Matches this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const matchesThisMonth = completedMatches.filter(m => {
    const matchDate = new Date(m.date)
    return matchDate.getMonth() === currentMonth && matchDate.getFullYear() === currentYear
  }).length

  // Sport distribution
  const sportCounts = completedMatches.reduce((acc, match) => {
    acc[match.sport] = (acc[match.sport] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const stats = [
    {
      title: "Total Matches",
      value: completedMatches.length.toString(),
      icon: Calendar,
      description: `${matchesThisMonth} this month`,
      color: "text-primary"
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      icon: Target,
      description: `${wins}W - ${losses}L`,
      color: "text-secondary"
    },
    {
      title: "Current Streak",
      value: currentStreak.streak.toString(),
      icon: Flame,
      description: currentStreak.type ? `${currentStreak.type === "win" ? "Win" : "Loss"} streak` : "No matches yet",
      color: currentStreak.type === "win" ? "text-green-400" : "text-destructive"
    },
    {
      title: "Wins",
      value: wins.toString(),
      icon: Trophy,
      description: "Total victories",
      color: "text-primary"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Most Played Opponent */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Rival
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostPlayedOpponent ? (
              <>
                <p className="text-xl font-semibold text-foreground">{mostPlayedOpponent[0]}</p>
                <p className="text-sm text-muted-foreground">{mostPlayedOpponent[1]} matches played</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No matches yet</p>
            )}
          </CardContent>
        </Card>

        {/* Favorite Court */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Favorite Court
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteLocation ? (
              <>
                <p className="text-xl font-semibold text-foreground truncate">{favoriteLocation[0]}</p>
                <p className="text-sm text-muted-foreground">{favoriteLocation[1]} matches here</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No matches yet</p>
            )}
          </CardContent>
        </Card>

        {/* Sport Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Sports Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(sportCounts).length > 0 ? (
                Object.entries(sportCounts).map(([sport, count]) => (
                  <Badge key={sport} variant="secondary" className="capitalize">
                    {sport}: {count}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No matches yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Form */}
      {completedMatches.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {[...completedMatches]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .reverse()
                .map((match) => (
                  <div
                    key={match.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      match.winner === "player1"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-destructive/20 text-destructive"
                    }`}
                    title={`vs ${match.opponent} - ${match.winner === "player1" ? "Win" : "Loss"}`}
                  >
                    {match.winner === "player1" ? "W" : "L"}
                  </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Last {Math.min(completedMatches.length, 10)} matches</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
