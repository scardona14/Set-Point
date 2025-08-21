"use client"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Calendar,
  Clock,
  MapPin,
  Users,
  BarChart3,
  PieChartIcon,
  Activity,
  Zap,
} from "lucide-react"
import { AnalyticsService, type MatchAnalytics, type PerformanceInsights } from "@/lib/analytics-service"

interface AnalyticsDashboardProps {
  currentUser: {
    id: string
    name: string
    email: string
  }
  matches: any[]
}

export function AnalyticsDashboard({ currentUser, matches }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<MatchAnalytics | null>(null)
  const [insights, setInsights] = useState<PerformanceInsights | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<"all" | "6months" | "3months" | "1month">("all")

  const analyticsService = AnalyticsService.getInstance()

  const filteredMatches = useMemo(() => {
    if (selectedTimeframe === "all") return matches

    const now = new Date()
    const cutoffDate = new Date()

    switch (selectedTimeframe) {
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case "3months":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case "1month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
    }

    return matches.filter((match) => new Date(match.date) >= cutoffDate)
  }, [matches, selectedTimeframe])

  useEffect(() => {
    const matchAnalytics = analyticsService.generateMatchAnalytics(currentUser.id, filteredMatches)
    const performanceInsights = analyticsService.generatePerformanceInsights(matchAnalytics)

    setAnalytics(matchAnalytics)
    setInsights(performanceInsights)
  }, [currentUser.id, filteredMatches, analyticsService])

  if (!analytics || !insights) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Track your tennis performance and progress</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground">Play some matches to see your analytics!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const chartConfig = {
    wins: {
      label: "Wins",
      color: "hsl(var(--chart-1))",
    },
    losses: {
      label: "Losses",
      color: "hsl(var(--chart-2))",
    },
    winRate: {
      label: "Win Rate %",
      color: "hsl(var(--chart-3))",
    },
  }

  const pieData = [
    { name: "Wins", value: analytics.wins, fill: "hsl(var(--chart-1))" },
    { name: "Losses", value: analytics.losses, fill: "hsl(var(--chart-2))" },
  ]

  const skillData = analytics.skillProgression.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    skill: point.skillLevel,
    confidence: point.confidence,
  }))

  const timeOfDayData = analytics.performanceByTimeOfDay.map((stat) => ({
    time: stat.timeSlot,
    matches: stat.matches,
    winRate: stat.winRate,
  }))

  const dayOfWeekData = analytics.performanceByDayOfWeek.map((stat) => ({
    day: stat.day.slice(0, 3),
    matches: stat.matches,
    winRate: stat.winRate,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your tennis performance and progress</p>
        </div>
        <div className="flex gap-2">
          {(["all", "6months", "3months", "1month"] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe === "all" ? "All Time" : timeframe.replace("months", "M").replace("month", "M")}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalMatches}</p>
                <p className="text-sm text-muted-foreground">Total Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.winRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.currentStreak.count}</p>
                <p className="text-sm text-muted-foreground">
                  Current {analytics.currentStreak.type === "win" ? "Win" : "Loss"} Streak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.longestWinStreak}</p>
                <p className="text-sm text-muted-foreground">Best Win Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="opponents">Opponents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Win/Loss Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Win/Loss Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Monthly Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="wins" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="losses" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Time and Day */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Performance by Time of Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeOfDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="winRate" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Performance by Day of Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="winRate" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Skill Progression */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skill Progression Over Time
              </CardTitle>
              <CardDescription>Track your improvement and confidence growth</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skillData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="skill"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-1))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-2))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Favorite Opponents and Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Favorite Opponents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.favoriteOpponents.slice(0, 5).map((opponent, index) => (
                  <div key={opponent.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{opponent.name}</p>
                      <p className="text-sm text-muted-foreground">{opponent.matches} matches</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={opponent.winRate >= 50 ? "default" : "secondary"}>
                        {opponent.winRate.toFixed(0)}% win rate
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Preferred Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.preferredLocations.slice(0, 5).map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{location.location}</p>
                      <p className="text-sm text-muted-foreground">{location.matches} matches</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={location.winRate >= 50 ? "default" : "secondary"}>
                        {location.winRate.toFixed(0)}% win rate
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.strengths.length > 0 ? (
                  insights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Play more matches to identify strengths</p>
                )}
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.weaknesses.length > 0 ? (
                  insights.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <p className="text-sm">{weakness}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Next Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Award className="h-5 w-5" />
                  Next Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.nextGoals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <p className="text-sm">{goal}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opponents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opponent Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your performance against different opponents</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.favoriteOpponents.length > 0 ? (
                <div className="space-y-4">
                  {analytics.favoriteOpponents.map((opponent) => (
                    <div key={opponent.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{opponent.name}</h4>
                        <Badge variant={opponent.winRate >= 50 ? "default" : "secondary"}>
                          {opponent.winRate.toFixed(0)}% win rate
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Matches</p>
                          <p className="font-medium">{opponent.matches}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Wins</p>
                          <p className="font-medium text-green-600">
                            {Math.round((opponent.winRate / 100) * opponent.matches)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Losses</p>
                          <p className="font-medium text-red-600">
                            {opponent.matches - Math.round((opponent.winRate / 100) * opponent.matches)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Progress value={opponent.winRate} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Opponent Data</h3>
                  <p className="text-muted-foreground">Play matches to see opponent analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
