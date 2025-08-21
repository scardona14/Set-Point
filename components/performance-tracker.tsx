"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { Target, TrendingUp, TrendingDown, Award, Activity, BarChart3, Plus, AlertCircle } from "lucide-react"
import {
  PerformanceService,
  type PerformanceMetrics,
  type PerformanceGoal,
  type PerformanceTrend,
  type PerformanceInsight,
  type TrainingRecommendation,
} from "@/lib/performance-service"
import { toast } from "@/hooks/use-toast"

interface PerformanceTrackerProps {
  currentUser: {
    id: string
    name: string
    email: string
  }
  matches: any[]
}

export function PerformanceTracker({ currentUser, matches }: PerformanceTrackerProps) {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([])
  const [goals, setGoals] = useState<PerformanceGoal[]>([])
  const [trends, setTrends] = useState<PerformanceTrend[]>([])
  const [insights, setInsights] = useState<PerformanceInsight[]>([])
  const [recommendations, setRecommendations] = useState<TrainingRecommendation[]>([])
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [timeframe, setTimeframe] = useState<"1month" | "3months" | "6months" | "1year">("3months")

  const performanceService = PerformanceService.getInstance()

  useEffect(() => {
    loadPerformanceData()
  }, [currentUser.id, timeframe])

  const loadPerformanceData = () => {
    const metrics = performanceService.getUserPerformanceMetrics(currentUser.id)
    const userGoals = performanceService.getUserGoals(currentUser.id)
    const performanceTrends = performanceService.calculatePerformanceTrends(currentUser.id, timeframe)
    const performanceInsights = performanceService.generatePerformanceInsights(currentUser.id)
    const trainingRecs = performanceService.generateTrainingRecommendations(currentUser.id)

    setPerformanceMetrics(metrics)
    setGoals(userGoals)
    setTrends(performanceTrends)
    setInsights(performanceInsights)
    setRecommendations(trainingRecs)

    // Update goal progress
    userGoals.forEach((goal) => {
      performanceService.updateGoalProgress(currentUser.id, goal.id)
    })
  }

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMatch) return

    const formData = new FormData(e.target as HTMLFormElement)

    const metrics: PerformanceMetrics = {
      matchId: selectedMatch.id,
      userId: currentUser.id,
      date: selectedMatch.date,
      opponent: selectedMatch.opponent,
      won: selectedMatch.won || false,
      score: selectedMatch.score || "",
      duration: Number.parseInt(formData.get("duration") as string) || 90,

      // Serve metrics
      firstServePercentage: Number.parseInt(formData.get("firstServePercentage") as string) || 0,
      secondServePercentage: Number.parseInt(formData.get("secondServePercentage") as string) || 0,
      acesCount: Number.parseInt(formData.get("acesCount") as string) || 0,
      doubleFaultsCount: Number.parseInt(formData.get("doubleFaultsCount") as string) || 0,
      serviceGamesWon: Number.parseInt(formData.get("serviceGamesWon") as string) || 0,
      serviceGamesPlayed: Number.parseInt(formData.get("serviceGamesPlayed") as string) || 0,

      // Return metrics
      firstServeReturnWon: Number.parseInt(formData.get("firstServeReturnWon") as string) || 0,
      secondServeReturnWon: Number.parseInt(formData.get("secondServeReturnWon") as string) || 0,
      breakPointsConverted: Number.parseInt(formData.get("breakPointsConverted") as string) || 0,
      breakPointsOpportunities: Number.parseInt(formData.get("breakPointsOpportunities") as string) || 0,
      returnGamesWon: Number.parseInt(formData.get("returnGamesWon") as string) || 0,
      returnGamesPlayed: Number.parseInt(formData.get("returnGamesPlayed") as string) || 0,

      // Rally metrics
      winnersCount: Number.parseInt(formData.get("winnersCount") as string) || 0,
      unforcedErrorsCount: Number.parseInt(formData.get("unforcedErrorsCount") as string) || 0,
      forcedErrorsCount: Number.parseInt(formData.get("forcedErrorsCount") as string) || 0,
      netApproaches: Number.parseInt(formData.get("netApproaches") as string) || 0,
      netPointsWon: Number.parseInt(formData.get("netPointsWon") as string) || 0,

      // Physical ratings
      enduranceRating: Number.parseInt(formData.get("enduranceRating") as string) || 5,
      consistencyRating: Number.parseInt(formData.get("consistencyRating") as string) || 5,
      movementRating: Number.parseInt(formData.get("movementRating") as string) || 5,
      mentalToughnessRating: Number.parseInt(formData.get("mentalToughnessRating") as string) || 5,

      // Stroke analysis
      forehandWinners: Number.parseInt(formData.get("forehandWinners") as string) || 0,
      backhandWinners: Number.parseInt(formData.get("backhandWinners") as string) || 0,
      forehandErrors: Number.parseInt(formData.get("forehandErrors") as string) || 0,
      backhandErrors: Number.parseInt(formData.get("backhandErrors") as string) || 0,

      // Context
      surface: (formData.get("surface") as any) || "hard",
      weather: (formData.get("weather") as any) || "sunny",
      matchType: (formData.get("matchType") as any) || "friendly",

      // Assessment
      overallPerformance: Number.parseInt(formData.get("overallPerformance") as string) || 5,
      areasOfImprovement: ((formData.get("areasOfImprovement") as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      positiveAspects: ((formData.get("positiveAspects") as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      notes: (formData.get("notes") as string) || "",
    }

    performanceService.savePerformanceMetrics(metrics)
    loadPerformanceData()
    setIsMetricsDialogOpen(false)
    setSelectedMatch(null)

    toast({
      title: "Performance metrics saved!",
      description: "Your match performance has been recorded and analyzed.",
    })
  }

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const goal = performanceService.createPerformanceGoal({
      userId: currentUser.id,
      category: formData.get("category") as any,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      targetValue: Number.parseFloat(formData.get("targetValue") as string),
      currentValue: 0,
      unit: formData.get("unit") as string,
      deadline: formData.get("deadline") as string,
      priority: formData.get("priority") as any,
    })

    loadPerformanceData()
    setIsGoalDialogOpen(false)

    toast({
      title: "Goal created!",
      description: `Your goal "${goal.title}" has been set.`,
    })
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <Award className="h-4 w-4 text-green-600" />
      case "weakness":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "opportunity":
        return <Target className="h-4 w-4 text-blue-600" />
      case "trend":
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const chartConfig = {
    performance: {
      label: "Performance",
      color: "hsl(var(--chart-1))",
    },
    trend: {
      label: "Trend",
      color: "hsl(var(--chart-2))",
    },
  }

  // Prepare chart data
  const performanceChartData = performanceMetrics
    .slice(0, 10)
    .reverse()
    .map((metric, index) => ({
      match: `Match ${index + 1}`,
      overall: metric.overallPerformance,
      serve: metric.firstServePercentage,
      winners: metric.winnersCount,
      errors: metric.unforcedErrorsCount,
    }))

  const radarData =
    performanceMetrics.length > 0
      ? [
          {
            category: "Serve",
            value: performanceMetrics[0]?.firstServePercentage || 0,
            fullMark: 100,
          },
          {
            category: "Return",
            value: (performanceMetrics[0]?.breakPointsConverted || 0) * 10,
            fullMark: 100,
          },
          {
            category: "Winners",
            value: (performanceMetrics[0]?.winnersCount || 0) * 3,
            fullMark: 100,
          },
          {
            category: "Consistency",
            value: (performanceMetrics[0]?.consistencyRating || 0) * 10,
            fullMark: 100,
          },
          {
            category: "Endurance",
            value: (performanceMetrics[0]?.enduranceRating || 0) * 10,
            fullMark: 100,
          },
          {
            category: "Mental",
            value: (performanceMetrics[0]?.mentalToughnessRating || 0) * 10,
            fullMark: 100,
          },
        ]
      : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Tracking</h2>
          <p className="text-muted-foreground">Detailed analysis of your tennis performance and improvement</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isMetricsDialogOpen} onOpenChange={setIsMetricsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Metrics
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Match Performance</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Select Match</Label>
                  <Select
                    onValueChange={(value) => {
                      const match = matches.find((m) => m.id === value)
                      setSelectedMatch(match)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a match to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches
                        .filter((m) => m.status === "completed")
                        .map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            vs {match.opponent} - {new Date(match.date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMatch && (
                  <form onSubmit={handleSaveMetrics} className="space-y-6">
                    <Tabs defaultValue="serve" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="serve">Serve</TabsTrigger>
                        <TabsTrigger value="return">Return</TabsTrigger>
                        <TabsTrigger value="rally">Rally</TabsTrigger>
                        <TabsTrigger value="physical">Physical</TabsTrigger>
                        <TabsTrigger value="context">Context</TabsTrigger>
                      </TabsList>

                      <TabsContent value="serve" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstServePercentage">First Serve % (0-100)</Label>
                            <Input
                              id="firstServePercentage"
                              name="firstServePercentage"
                              type="number"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <Label htmlFor="secondServePercentage">Second Serve % (0-100)</Label>
                            <Input
                              id="secondServePercentage"
                              name="secondServePercentage"
                              type="number"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <Label htmlFor="acesCount">Aces</Label>
                            <Input id="acesCount" name="acesCount" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="doubleFaultsCount">Double Faults</Label>
                            <Input id="doubleFaultsCount" name="doubleFaultsCount" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="serviceGamesWon">Service Games Won</Label>
                            <Input id="serviceGamesWon" name="serviceGamesWon" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="serviceGamesPlayed">Service Games Played</Label>
                            <Input id="serviceGamesPlayed" name="serviceGamesPlayed" type="number" min="0" />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="return" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstServeReturnWon">1st Serve Returns Won %</Label>
                            <Input
                              id="firstServeReturnWon"
                              name="firstServeReturnWon"
                              type="number"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <Label htmlFor="secondServeReturnWon">2nd Serve Returns Won %</Label>
                            <Input
                              id="secondServeReturnWon"
                              name="secondServeReturnWon"
                              type="number"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div>
                            <Label htmlFor="breakPointsConverted">Break Points Converted</Label>
                            <Input id="breakPointsConverted" name="breakPointsConverted" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="breakPointsOpportunities">Break Point Opportunities</Label>
                            <Input
                              id="breakPointsOpportunities"
                              name="breakPointsOpportunities"
                              type="number"
                              min="0"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="rally" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="winnersCount">Winners</Label>
                            <Input id="winnersCount" name="winnersCount" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="unforcedErrorsCount">Unforced Errors</Label>
                            <Input id="unforcedErrorsCount" name="unforcedErrorsCount" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="forehandWinners">Forehand Winners</Label>
                            <Input id="forehandWinners" name="forehandWinners" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="backhandWinners">Backhand Winners</Label>
                            <Input id="backhandWinners" name="backhandWinners" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="netApproaches">Net Approaches</Label>
                            <Input id="netApproaches" name="netApproaches" type="number" min="0" />
                          </div>
                          <div>
                            <Label htmlFor="netPointsWon">Net Points Won</Label>
                            <Input id="netPointsWon" name="netPointsWon" type="number" min="0" />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="physical" className="space-y-4">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="enduranceRating">Endurance Rating (1-10)</Label>
                            <Slider
                              name="enduranceRating"
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[5]}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="consistencyRating">Consistency Rating (1-10)</Label>
                            <Slider
                              name="consistencyRating"
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[5]}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="movementRating">Movement Rating (1-10)</Label>
                            <Slider
                              name="movementRating"
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[5]}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="mentalToughnessRating">Mental Toughness (1-10)</Label>
                            <Slider
                              name="mentalToughnessRating"
                              min={1}
                              max={10}
                              step={1}
                              defaultValue={[5]}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="context" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="surface">Court Surface</Label>
                            <Select name="surface">
                              <SelectTrigger>
                                <SelectValue placeholder="Select surface" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hard">Hard Court</SelectItem>
                                <SelectItem value="clay">Clay</SelectItem>
                                <SelectItem value="grass">Grass</SelectItem>
                                <SelectItem value="indoor">Indoor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="weather">Weather Conditions</Label>
                            <Select name="weather">
                              <SelectTrigger>
                                <SelectValue placeholder="Select weather" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sunny">Sunny</SelectItem>
                                <SelectItem value="cloudy">Cloudy</SelectItem>
                                <SelectItem value="windy">Windy</SelectItem>
                                <SelectItem value="hot">Hot</SelectItem>
                                <SelectItem value="cold">Cold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="matchType">Match Type</Label>
                            <Select name="matchType">
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="practice">Practice</SelectItem>
                                <SelectItem value="tournament">Tournament</SelectItem>
                                <SelectItem value="league">League</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="duration">Match Duration (minutes)</Label>
                            <Input id="duration" name="duration" type="number" min="30" max="300" defaultValue="90" />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="overallPerformance">Overall Performance (1-10)</Label>
                          <Slider
                            name="overallPerformance"
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[5]}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="positiveAspects">What went well? (comma separated)</Label>
                          <Textarea
                            id="positiveAspects"
                            name="positiveAspects"
                            placeholder="Strong serve, good movement, mental toughness..."
                          />
                        </div>

                        <div>
                          <Label htmlFor="areasOfImprovement">Areas for improvement (comma separated)</Label>
                          <Textarea
                            id="areasOfImprovement"
                            name="areasOfImprovement"
                            placeholder="Backhand consistency, net play, return of serve..."
                          />
                        </div>

                        <div>
                          <Label htmlFor="notes">Additional Notes</Label>
                          <Textarea id="notes" name="notes" placeholder="Any other observations about the match..." />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button type="submit" className="w-full">
                      Save Performance Metrics
                    </Button>
                  </form>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {performanceMetrics.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
                <p className="text-muted-foreground mb-4">
                  Record your first match performance to see detailed analytics
                </p>
                <Button onClick={() => setIsMetricsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Performance Metrics
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="match" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="overall"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--chart-1))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar
                          name="Performance"
                          dataKey="value"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map((trend, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{trend.metric}</h4>
                    {getTrendIcon(trend.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current:</span>
                      <span className="font-medium">{trend.current.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Previous:</span>
                      <span>{trend.previous.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Change:</span>
                      <span
                        className={`font-medium ${trend.change > 0 ? "text-green-600" : trend.change < 0 ? "text-red-600" : "text-gray-600"}`}
                      >
                        {trend.change > 0 ? "+" : ""}
                        {trend.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Performance Goals</h3>
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Performance Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateGoal} className="space-y-4">
                  <div>
                    <Label htmlFor="goal-category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serve">Serve</SelectItem>
                        <SelectItem value="return">Return</SelectItem>
                        <SelectItem value="rally">Rally</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="mental">Mental</SelectItem>
                        <SelectItem value="overall">Overall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input id="goal-title" name="title" placeholder="Improve first serve percentage" required />
                  </div>
                  <div>
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea
                      id="goal-description"
                      name="description"
                      placeholder="Achieve consistent 70% first serve percentage"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goal-target">Target Value</Label>
                      <Input id="goal-target" name="targetValue" type="number" step="0.1" required />
                    </div>
                    <div>
                      <Label htmlFor="goal-unit">Unit</Label>
                      <Input id="goal-unit" name="unit" placeholder="%" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="goal-deadline">Deadline</Label>
                    <Input id="goal-deadline" name="deadline" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="goal-priority">Priority</Label>
                    <Select name="priority" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Goal
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <Badge variant={goal.status === "completed" ? "default" : "secondary"}>{goal.status}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>
                        {goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                      <span
                        className={`capitalize ${goal.priority === "high" ? "text-red-600" : goal.priority === "medium" ? "text-yellow-600" : "text-green-600"}`}
                      >
                        {goal.priority} priority
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <p className="text-sm text-blue-600 font-medium">{insight.recommendation}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    <Badge
                      variant={
                        rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {rec.priority}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{rec.estimatedTime} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <span className="capitalize">{rec.difficulty}</span>
                    </div>
                    <div>
                      <span className="font-medium">Equipment needed:</span>
                      <p className="text-muted-foreground">{rec.equipment.join(", ")}</p>
                    </div>
                    <div>
                      <span className="font-medium">Instructions:</span>
                      <ul className="list-disc list-inside text-muted-foreground mt-1">
                        {rec.instructions.slice(0, 2).map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
