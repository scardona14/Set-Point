// Advanced Performance Tracking Service
export interface PerformanceMetrics {
  matchId: string
  userId: string
  date: string
  opponent: string

  // Match Outcome
  won: boolean
  score: string
  duration: number // minutes

  // Serve Performance
  firstServePercentage: number
  secondServePercentage: number
  acesCount: number
  doubleFaultsCount: number
  serviceGamesWon: number
  serviceGamesPlayed: number

  // Return Performance
  firstServeReturnWon: number
  secondServeReturnWon: number
  breakPointsConverted: number
  breakPointsOpportunities: number
  returnGamesWon: number
  returnGamesPlayed: number

  // Rally Performance
  winnersCount: number
  unforcedErrorsCount: number
  forcedErrorsCount: number
  netApproaches: number
  netPointsWon: number

  // Physical Performance
  enduranceRating: number // 1-10
  consistencyRating: number // 1-10
  movementRating: number // 1-10
  mentalToughnessRating: number // 1-10

  // Court Coverage
  forehandWinners: number
  backhandWinners: number
  forehandErrors: number
  backhandErrors: number

  // Match Context
  surface: "hard" | "clay" | "grass" | "indoor"
  weather: "sunny" | "cloudy" | "windy" | "hot" | "cold"
  matchType: "practice" | "tournament" | "league" | "friendly"

  // Self Assessment
  overallPerformance: number // 1-10
  areasOfImprovement: string[]
  positiveAspects: string[]
  notes: string
}

export interface PerformanceTrend {
  metric: string
  current: number
  previous: number
  change: number
  trend: "improving" | "declining" | "stable"
  period: string
}

export interface PerformanceGoal {
  id: string
  userId: string
  category: "serve" | "return" | "rally" | "physical" | "mental" | "overall"
  title: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  priority: "low" | "medium" | "high"
  status: "active" | "completed" | "paused"
  createdAt: string
  completedAt?: string
}

export interface TrainingRecommendation {
  id: string
  category: "technique" | "fitness" | "mental" | "strategy"
  title: string
  description: string
  priority: "low" | "medium" | "high"
  estimatedTime: number // minutes
  difficulty: "beginner" | "intermediate" | "advanced"
  equipment: string[]
  instructions: string[]
  videoUrl?: string
  basedOnWeakness: string
}

export interface PerformanceInsight {
  type: "strength" | "weakness" | "opportunity" | "trend"
  title: string
  description: string
  impact: "low" | "medium" | "high"
  actionable: boolean
  recommendation?: string
  data: any
}

export class PerformanceService {
  private static instance: PerformanceService
  private readonly PERFORMANCE_KEY = "setpoint_performance"
  private readonly GOALS_KEY = "setpoint_performance_goals"

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService()
    }
    return PerformanceService.instance
  }

  // Performance Metrics Management
  savePerformanceMetrics(metrics: PerformanceMetrics): void {
    if (typeof window === "undefined") return

    const key = `${this.PERFORMANCE_KEY}_${metrics.userId}`
    const existing = this.getUserPerformanceMetrics(metrics.userId)

    // Remove existing metrics for the same match if updating
    const filtered = existing.filter((m) => m.matchId !== metrics.matchId)
    filtered.push(metrics)

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    localStorage.setItem(key, JSON.stringify(filtered))
  }

  getUserPerformanceMetrics(userId: string): PerformanceMetrics[] {
    if (typeof window === "undefined") return []

    const key = `${this.PERFORMANCE_KEY}_${userId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  getPerformanceMetrics(userId: string, matchId: string): PerformanceMetrics | null {
    const metrics = this.getUserPerformanceMetrics(userId)
    return metrics.find((m) => m.matchId === matchId) || null
  }

  // Performance Analysis
  calculatePerformanceTrends(
    userId: string,
    timeframe: "1month" | "3months" | "6months" | "1year",
  ): PerformanceTrend[] {
    const metrics = this.getUserPerformanceMetrics(userId)
    if (metrics.length < 2) return []

    const cutoffDate = new Date()
    switch (timeframe) {
      case "1month":
        cutoffDate.setMonth(cutoffDate.getMonth() - 1)
        break
      case "3months":
        cutoffDate.setMonth(cutoffDate.getMonth() - 3)
        break
      case "6months":
        cutoffDate.setMonth(cutoffDate.getMonth() - 6)
        break
      case "1year":
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1)
        break
    }

    const recentMetrics = metrics.filter((m) => new Date(m.date) >= cutoffDate)
    if (recentMetrics.length < 2) return []

    const midpoint = Math.floor(recentMetrics.length / 2)
    const recent = recentMetrics.slice(0, midpoint)
    const older = recentMetrics.slice(midpoint)

    const trends: PerformanceTrend[] = []

    // Calculate trends for key metrics
    const metricsToTrack = [
      { key: "firstServePercentage", name: "First Serve %" },
      { key: "acesCount", name: "Aces per Match" },
      { key: "doubleFaultsCount", name: "Double Faults" },
      { key: "winnersCount", name: "Winners per Match" },
      { key: "unforcedErrorsCount", name: "Unforced Errors" },
      { key: "enduranceRating", name: "Endurance Rating" },
      { key: "consistencyRating", name: "Consistency Rating" },
      { key: "overallPerformance", name: "Overall Performance" },
    ]

    metricsToTrack.forEach((metric) => {
      const recentAvg = this.calculateAverage(recent, metric.key as keyof PerformanceMetrics)
      const olderAvg = this.calculateAverage(older, metric.key as keyof PerformanceMetrics)

      if (recentAvg !== null && olderAvg !== null) {
        const change = recentAvg - olderAvg
        const changePercent = olderAvg !== 0 ? (change / olderAvg) * 100 : 0

        let trend: "improving" | "declining" | "stable" = "stable"
        if (Math.abs(changePercent) > 5) {
          // For negative metrics (errors, double faults), declining numbers are good
          const isNegativeMetric = metric.key.includes("Error") || metric.key.includes("doubleFaults")
          if (isNegativeMetric) {
            trend = change < 0 ? "improving" : "declining"
          } else {
            trend = change > 0 ? "improving" : "declining"
          }
        }

        trends.push({
          metric: metric.name,
          current: recentAvg,
          previous: olderAvg,
          change: changePercent,
          trend,
          period: timeframe,
        })
      }
    })

    return trends
  }

  generatePerformanceInsights(userId: string): PerformanceInsight[] {
    const metrics = this.getUserPerformanceMetrics(userId)
    if (metrics.length === 0) return []

    const insights: PerformanceInsight[] = []
    const recent = metrics.slice(0, Math.min(5, metrics.length))
    const trends = this.calculatePerformanceTrends(userId, "3months")

    // Analyze strengths
    const avgFirstServe = this.calculateAverage(recent, "firstServePercentage")
    if (avgFirstServe && avgFirstServe > 65) {
      insights.push({
        type: "strength",
        title: "Strong First Serve",
        description: `Your first serve percentage of ${avgFirstServe.toFixed(1)}% is above average`,
        impact: "high",
        actionable: false,
        data: { value: avgFirstServe },
      })
    }

    // Analyze weaknesses
    const avgUnforcedErrors = this.calculateAverage(recent, "unforcedErrorsCount")
    if (avgUnforcedErrors && avgUnforcedErrors > 20) {
      insights.push({
        type: "weakness",
        title: "High Unforced Errors",
        description: `You're averaging ${avgUnforcedErrors.toFixed(1)} unforced errors per match`,
        impact: "high",
        actionable: true,
        recommendation: "Focus on consistency drills and shot selection",
        data: { value: avgUnforcedErrors },
      })
    }

    // Analyze trends
    trends.forEach((trend) => {
      if (trend.trend === "improving" && Math.abs(trend.change) > 10) {
        insights.push({
          type: "trend",
          title: `Improving ${trend.metric}`,
          description: `Your ${trend.metric.toLowerCase()} has improved by ${trend.change.toFixed(1)}% over the last ${trend.period}`,
          impact: "medium",
          actionable: false,
          data: trend,
        })
      } else if (trend.trend === "declining" && Math.abs(trend.change) > 10) {
        insights.push({
          type: "opportunity",
          title: `Focus on ${trend.metric}`,
          description: `Your ${trend.metric.toLowerCase()} has declined by ${Math.abs(trend.change).toFixed(1)}% recently`,
          impact: "medium",
          actionable: true,
          recommendation: `Consider targeted practice for ${trend.metric.toLowerCase()}`,
          data: trend,
        })
      }
    })

    return insights.slice(0, 8) // Return top 8 insights
  }

  // Goals Management
  createPerformanceGoal(goal: Omit<PerformanceGoal, "id" | "createdAt" | "status">): PerformanceGoal {
    const newGoal: PerformanceGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "active",
    }

    const goals = this.getUserGoals(goal.userId)
    goals.push(newGoal)
    this.saveUserGoals(goal.userId, goals)

    return newGoal
  }

  getUserGoals(userId: string): PerformanceGoal[] {
    if (typeof window === "undefined") return []

    const key = `${this.GOALS_KEY}_${userId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  updateGoalProgress(userId: string, goalId: string): void {
    const goals = this.getUserGoals(userId)
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    // Update current value based on recent performance
    const metrics = this.getUserPerformanceMetrics(userId)
    const recentMetrics = metrics.slice(0, 5) // Last 5 matches

    switch (goal.category) {
      case "serve":
        if (goal.title.includes("First Serve")) {
          goal.currentValue = this.calculateAverage(recentMetrics, "firstServePercentage") || 0
        } else if (goal.title.includes("Aces")) {
          goal.currentValue = this.calculateAverage(recentMetrics, "acesCount") || 0
        }
        break
      case "return":
        goal.currentValue = this.calculateAverage(recentMetrics, "breakPointsConverted") || 0
        break
      case "rally":
        if (goal.title.includes("Winners")) {
          goal.currentValue = this.calculateAverage(recentMetrics, "winnersCount") || 0
        } else if (goal.title.includes("Errors")) {
          goal.currentValue = this.calculateAverage(recentMetrics, "unforcedErrorsCount") || 0
        }
        break
      case "physical":
        goal.currentValue = this.calculateAverage(recentMetrics, "enduranceRating") || 0
        break
    }

    // Check if goal is completed
    if (goal.currentValue >= goal.targetValue && goal.status === "active") {
      goal.status = "completed"
      goal.completedAt = new Date().toISOString()
    }

    this.saveUserGoals(userId, goals)
  }

  // Training Recommendations
  generateTrainingRecommendations(userId: string): TrainingRecommendation[] {
    const insights = this.generatePerformanceInsights(userId)
    const recommendations: TrainingRecommendation[] = []

    insights.forEach((insight) => {
      if (insight.type === "weakness" || insight.type === "opportunity") {
        if (insight.title.includes("Unforced Errors")) {
          recommendations.push({
            id: `rec_${Date.now()}_1`,
            category: "technique",
            title: "Consistency Training",
            description: "Focus on controlled rallies and shot placement to reduce unforced errors",
            priority: "high",
            estimatedTime: 45,
            difficulty: "intermediate",
            equipment: ["Tennis balls", "Cones", "Court"],
            instructions: [
              "Start with cross-court rallies at 70% pace",
              "Focus on hitting to specific targets",
              "Gradually increase pace while maintaining control",
              "Practice 20 consecutive shots without errors",
            ],
            basedOnWeakness: "High unforced errors",
          })
        }

        if (insight.title.includes("First Serve")) {
          recommendations.push({
            id: `rec_${Date.now()}_2`,
            category: "technique",
            title: "Serve Accuracy Drills",
            description: "Improve first serve percentage with targeted practice",
            priority: "high",
            estimatedTime: 30,
            difficulty: "intermediate",
            equipment: ["Tennis balls", "Service boxes", "Targets"],
            instructions: [
              "Practice serving to specific service box corners",
              "Start with 50% power, focus on placement",
              "Gradually increase power while maintaining accuracy",
              "Track successful serves out of 20 attempts",
            ],
            basedOnWeakness: "Low first serve percentage",
          })
        }
      }
    })

    // Add general recommendations
    recommendations.push(
      {
        id: `rec_general_1`,
        category: "fitness",
        title: "Court Movement Drills",
        description: "Improve agility and court coverage",
        priority: "medium",
        estimatedTime: 30,
        difficulty: "beginner",
        equipment: ["Cones", "Court"],
        instructions: [
          "Set up cones in diamond pattern",
          "Sprint to each cone and back to center",
          "Focus on quick direction changes",
          "Repeat for 3 sets of 5 minutes",
        ],
        basedOnWeakness: "General fitness improvement",
      },
      {
        id: `rec_general_2`,
        category: "mental",
        title: "Match Pressure Training",
        description: "Build mental toughness for competitive situations",
        priority: "medium",
        estimatedTime: 20,
        difficulty: "intermediate",
        equipment: ["None"],
        instructions: [
          "Practice visualization techniques",
          "Simulate pressure situations in practice",
          "Work on breathing exercises between points",
          "Develop consistent pre-serve routine",
        ],
        basedOnWeakness: "Mental game improvement",
      },
    )

    return recommendations.slice(0, 6) // Return top 6 recommendations
  }

  // Utility Methods
  private calculateAverage(metrics: PerformanceMetrics[], key: keyof PerformanceMetrics): number | null {
    if (metrics.length === 0) return null

    const values = metrics.map((m) => m[key] as number).filter((v) => typeof v === "number" && !isNaN(v))
    if (values.length === 0) return null

    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  private saveUserGoals(userId: string, goals: PerformanceGoal[]): void {
    if (typeof window === "undefined") return

    const key = `${this.GOALS_KEY}_${userId}`
    localStorage.setItem(key, JSON.stringify(goals))
  }

  // Performance Comparison
  compareWithPeers(userId: string): any {
    // Mock peer comparison - in real app would compare with similar skill level players
    return {
      userRank: "Top 25%",
      comparisonMetrics: [
        { metric: "First Serve %", user: 68, peers: 62, better: true },
        { metric: "Winners/Match", user: 15, peers: 18, better: false },
        { metric: "Unforced Errors", user: 22, peers: 19, better: false },
        { metric: "Break Points Won", user: 45, peers: 42, better: true },
      ],
    }
  }

  // Export/Import Performance Data
  exportPerformanceData(userId: string): string {
    const metrics = this.getUserPerformanceMetrics(userId)
    const goals = this.getUserGoals(userId)

    return JSON.stringify(
      {
        metrics,
        goals,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      },
      null,
      2,
    )
  }

  importPerformanceData(userId: string, data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.metrics) {
        const key = `${this.PERFORMANCE_KEY}_${userId}`
        localStorage.setItem(key, JSON.stringify(parsed.metrics))
      }
      if (parsed.goals) {
        const key = `${this.GOALS_KEY}_${userId}`
        localStorage.setItem(key, JSON.stringify(parsed.goals))
      }
      return true
    } catch (error) {
      console.error("Failed to import performance data:", error)
      return false
    }
  }
}
