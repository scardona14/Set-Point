// Advanced Analytics Service for Tennis Performance Tracking
export interface MatchAnalytics {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  currentStreak: { type: "win" | "loss"; count: number }
  longestWinStreak: number
  longestLossStreak: number
  averageMatchDuration: number
  favoriteOpponents: { name: string; matches: number; winRate: number }[]
  preferredLocations: { location: string; matches: number; winRate: number }[]
  monthlyStats: MonthlyStats[]
  skillProgression: SkillProgressionPoint[]
  performanceByTimeOfDay: TimeOfDayStats[]
  performanceByDayOfWeek: DayOfWeekStats[]
}

export interface MonthlyStats {
  month: string
  year: number
  matches: number
  wins: number
  losses: number
  winRate: number
  hoursPlayed: number
}

export interface SkillProgressionPoint {
  date: string
  skillLevel: number
  confidence: number
  matchesPlayed: number
}

export interface TimeOfDayStats {
  timeSlot: string
  matches: number
  wins: number
  winRate: number
}

export interface DayOfWeekStats {
  day: string
  matches: number
  wins: number
  winRate: number
}

export interface OpponentAnalysis {
  opponentName: string
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  averageScore: string
  lastPlayed: string
  trend: "improving" | "declining" | "stable"
  headToHeadHistory: HeadToHeadMatch[]
}

export interface HeadToHeadMatch {
  date: string
  score: string
  won: boolean
  location: string
}

export interface PerformanceInsights {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  nextGoals: string[]
  improvementAreas: string[]
}

export class AnalyticsService {
  private static instance: AnalyticsService

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  generateMatchAnalytics(userId: string, matches: any[]): MatchAnalytics {
    const completedMatches = matches.filter((m) => m.status === "completed")
    const wins = completedMatches.filter((m) => m.won === true).length
    const losses = completedMatches.length - wins

    return {
      totalMatches: completedMatches.length,
      wins,
      losses,
      winRate: completedMatches.length > 0 ? (wins / completedMatches.length) * 100 : 0,
      currentStreak: this.calculateCurrentStreak(completedMatches),
      longestWinStreak: this.calculateLongestStreak(completedMatches, true),
      longestLossStreak: this.calculateLongestStreak(completedMatches, false),
      averageMatchDuration: this.calculateAverageMatchDuration(completedMatches),
      favoriteOpponents: this.analyzeFavoriteOpponents(completedMatches),
      preferredLocations: this.analyzePreferredLocations(completedMatches),
      monthlyStats: this.generateMonthlyStats(completedMatches),
      skillProgression: this.generateSkillProgression(completedMatches),
      performanceByTimeOfDay: this.analyzePerformanceByTimeOfDay(completedMatches),
      performanceByDayOfWeek: this.analyzePerformanceByDayOfWeek(completedMatches),
    }
  }

  generateOpponentAnalysis(matches: any[], opponentName: string): OpponentAnalysis {
    const opponentMatches = matches.filter((m) => m.opponent === opponentName && m.status === "completed")
    const wins = opponentMatches.filter((m) => m.won === true).length
    const losses = opponentMatches.length - wins

    return {
      opponentName,
      totalMatches: opponentMatches.length,
      wins,
      losses,
      winRate: opponentMatches.length > 0 ? (wins / opponentMatches.length) * 100 : 0,
      averageScore: this.calculateAverageScore(opponentMatches),
      lastPlayed: opponentMatches.length > 0 ? opponentMatches[opponentMatches.length - 1].date : "",
      trend: this.calculateTrend(opponentMatches),
      headToHeadHistory: opponentMatches.map((m) => ({
        date: m.date,
        score: m.score || "N/A",
        won: m.won || false,
        location: m.location,
      })),
    }
  }

  generatePerformanceInsights(analytics: MatchAnalytics): PerformanceInsights {
    const insights: PerformanceInsights = {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      nextGoals: [],
      improvementAreas: [],
    }

    // Analyze strengths
    if (analytics.winRate > 70) {
      insights.strengths.push("Excellent overall win rate")
    }
    if (analytics.currentStreak.type === "win" && analytics.currentStreak.count >= 3) {
      insights.strengths.push("Currently on a strong winning streak")
    }
    if (analytics.longestWinStreak >= 5) {
      insights.strengths.push("Capable of sustained winning performances")
    }

    // Analyze weaknesses
    if (analytics.winRate < 40) {
      insights.weaknesses.push("Win rate needs improvement")
    }
    if (analytics.currentStreak.type === "loss" && analytics.currentStreak.count >= 3) {
      insights.weaknesses.push("Currently struggling with consistency")
    }

    // Generate recommendations
    if (analytics.totalMatches < 10) {
      insights.recommendations.push("Play more matches to build experience")
    }
    if (analytics.winRate < 50) {
      insights.recommendations.push("Focus on fundamental skills and strategy")
    }
    if (analytics.favoriteOpponents.length < 3) {
      insights.recommendations.push("Expand your playing network to face diverse opponents")
    }

    // Set goals
    if (analytics.winRate < 60) {
      insights.nextGoals.push("Achieve 60% win rate")
    }
    if (analytics.longestWinStreak < 5) {
      insights.nextGoals.push("Build a 5-match winning streak")
    }
    insights.nextGoals.push("Play at least 2 matches per week")

    return insights
  }

  private calculateCurrentStreak(matches: any[]): { type: "win" | "loss"; count: number } {
    if (matches.length === 0) return { type: "win", count: 0 }

    const sortedMatches = matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const lastResult = sortedMatches[0].won
    let count = 0

    for (const match of sortedMatches) {
      if (match.won === lastResult) {
        count++
      } else {
        break
      }
    }

    return { type: lastResult ? "win" : "loss", count }
  }

  private calculateLongestStreak(matches: any[], isWinStreak: boolean): number {
    let maxStreak = 0
    let currentStreak = 0

    const sortedMatches = matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    for (const match of sortedMatches) {
      if (match.won === isWinStreak) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    return maxStreak
  }

  private calculateAverageMatchDuration(matches: any[]): number {
    // Mock calculation - in real app, you'd track actual match duration
    return 90 // minutes
  }

  private analyzeFavoriteOpponents(matches: any[]): { name: string; matches: number; winRate: number }[] {
    const opponentStats: { [key: string]: { matches: number; wins: number } } = {}

    matches.forEach((match) => {
      if (!opponentStats[match.opponent]) {
        opponentStats[match.opponent] = { matches: 0, wins: 0 }
      }
      opponentStats[match.opponent].matches++
      if (match.won) {
        opponentStats[match.opponent].wins++
      }
    })

    return Object.entries(opponentStats)
      .map(([name, stats]) => ({
        name,
        matches: stats.matches,
        winRate: (stats.wins / stats.matches) * 100,
      }))
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5)
  }

  private analyzePreferredLocations(matches: any[]): { location: string; matches: number; winRate: number }[] {
    const locationStats: { [key: string]: { matches: number; wins: number } } = {}

    matches.forEach((match) => {
      if (!locationStats[match.location]) {
        locationStats[match.location] = { matches: 0, wins: 0 }
      }
      locationStats[match.location].matches++
      if (match.won) {
        locationStats[match.location].wins++
      }
    })

    return Object.entries(locationStats)
      .map(([location, stats]) => ({
        location,
        matches: stats.matches,
        winRate: (stats.wins / stats.matches) * 100,
      }))
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5)
  }

  private generateMonthlyStats(matches: any[]): MonthlyStats[] {
    const monthlyData: { [key: string]: { matches: number; wins: number } } = {}

    matches.forEach((match) => {
      const date = new Date(match.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      const monthName = date.toLocaleDateString("en-US", { month: "short" })

      if (!monthlyData[key]) {
        monthlyData[key] = { matches: 0, wins: 0 }
      }
      monthlyData[key].matches++
      if (match.won) {
        monthlyData[key].wins++
      }
    })

    return Object.entries(monthlyData)
      .map(([key, stats]) => {
        const [year, month] = key.split("-")
        const date = new Date(Number.parseInt(year), Number.parseInt(month))
        return {
          month: date.toLocaleDateString("en-US", { month: "short" }),
          year: Number.parseInt(year),
          matches: stats.matches,
          wins: stats.wins,
          losses: stats.matches - stats.wins,
          winRate: (stats.wins / stats.matches) * 100,
          hoursPlayed: stats.matches * 1.5, // Estimated
        }
      })
      .sort((a, b) => a.year - b.year)
      .slice(-12) // Last 12 months
  }

  private generateSkillProgression(matches: any[]): SkillProgressionPoint[] {
    // Mock skill progression based on win rate over time
    const progression: SkillProgressionPoint[] = []
    let skillLevel = 3.0 // Starting skill level

    matches.forEach((match, index) => {
      if (match.won) {
        skillLevel += 0.1
      } else {
        skillLevel -= 0.05
      }

      skillLevel = Math.max(1.0, Math.min(5.0, skillLevel)) // Clamp between 1-5

      progression.push({
        date: match.date,
        skillLevel: Number.parseFloat(skillLevel.toFixed(1)),
        confidence: Math.min(100, (index + 1) * 5), // Confidence grows with matches
        matchesPlayed: index + 1,
      })
    })

    return progression
  }

  private analyzePerformanceByTimeOfDay(matches: any[]): TimeOfDayStats[] {
    const timeSlots = ["Morning", "Afternoon", "Evening"]
    const stats: { [key: string]: { matches: number; wins: number } } = {}

    timeSlots.forEach((slot) => {
      stats[slot] = { matches: 0, wins: 0 }
    })

    matches.forEach((match) => {
      const hour = new Date(`${match.date} ${match.time}`).getHours()
      let timeSlot = "Morning"
      if (hour >= 12 && hour < 17) timeSlot = "Afternoon"
      else if (hour >= 17) timeSlot = "Evening"

      stats[timeSlot].matches++
      if (match.won) {
        stats[timeSlot].wins++
      }
    })

    return timeSlots.map((slot) => ({
      timeSlot: slot,
      matches: stats[slot].matches,
      wins: stats[slot].wins,
      winRate: stats[slot].matches > 0 ? (stats[slot].wins / stats[slot].matches) * 100 : 0,
    }))
  }

  private analyzePerformanceByDayOfWeek(matches: any[]): DayOfWeekStats[] {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const stats: { [key: string]: { matches: number; wins: number } } = {}

    days.forEach((day) => {
      stats[day] = { matches: 0, wins: 0 }
    })

    matches.forEach((match) => {
      const day = new Date(match.date).toLocaleDateString("en-US", { weekday: "long" })
      stats[day].matches++
      if (match.won) {
        stats[day].wins++
      }
    })

    return days.map((day) => ({
      day,
      matches: stats[day].matches,
      wins: stats[day].wins,
      winRate: stats[day].matches > 0 ? (stats[day].wins / stats[day].matches) * 100 : 0,
    }))
  }

  private calculateAverageScore(matches: any[]): string {
    // Mock calculation - would analyze actual scores
    return "6-4, 6-3"
  }

  private calculateTrend(matches: any[]): "improving" | "declining" | "stable" {
    if (matches.length < 3) return "stable"

    const recent = matches.slice(-3)
    const older = matches.slice(-6, -3)

    const recentWinRate = recent.filter((m) => m.won).length / recent.length
    const olderWinRate = older.length > 0 ? older.filter((m) => m.won).length / older.length : 0.5

    if (recentWinRate > olderWinRate + 0.2) return "improving"
    if (recentWinRate < olderWinRate - 0.2) return "declining"
    return "stable"
  }
}
