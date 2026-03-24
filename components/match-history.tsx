"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, MapPin, Clock, Trophy, Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"

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
  matchFormat?: string
}

interface MatchHistoryProps {
  matches: Match[]
  userName: string
}

export function MatchHistory({ matches, userName }: MatchHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sportFilter, setSportFilter] = useState<string>("all")
  const [resultFilter, setResultFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [showFilters, setShowFilters] = useState(false)

  const filteredMatches = useMemo(() => {
    let filtered = [...matches]

    // Search by opponent or location
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        m => m.opponent.toLowerCase().includes(query) || 
             m.location.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(m => m.status === statusFilter)
    }

    // Sport filter
    if (sportFilter !== "all") {
      filtered = filtered.filter(m => m.sport === sportFilter)
    }

    // Result filter (win/loss)
    if (resultFilter !== "all") {
      filtered = filtered.filter(m => {
        if (m.status !== "completed") return false
        const isWin = m.winner === "player1"
        return resultFilter === "wins" ? isWin : !isWin
      })
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [matches, searchQuery, statusFilter, sportFilter, resultFilter, sortOrder])

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSportFilter("all")
    setResultFilter("all")
    setSortOrder("newest")
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || sportFilter !== "all" || resultFilter !== "all"

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Completed</Badge>
      case "upcoming":
        return <Badge variant="secondary" className="bg-primary/20 text-primary">Upcoming</Badge>
      case "in-progress":
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">In Progress</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { 
      weekday: "short",
      month: "short", 
      day: "numeric",
      year: "numeric"
    })
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by opponent or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-primary/10" : ""}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                    !
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Sport</Label>
                  <Select value={sportFilter} onValueChange={setSportFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="pickleball">Pickleball</SelectItem>
                      <SelectItem value="padel">Padel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Result</Label>
                  <Select value={resultFilter} onValueChange={setResultFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All results" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Results</SelectItem>
                      <SelectItem value="wins">Wins Only</SelectItem>
                      <SelectItem value="losses">Losses Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Sort</Label>
                  <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters} 
                    className="col-span-2 md:col-span-4 text-muted-foreground"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredMatches.length} of {matches.length} matches
      </div>

      {/* Match List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No matches found matching your filters.</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMatches.map((match) => {
            const isWin = match.status === "completed" && match.winner === "player1"
            const isLoss = match.status === "completed" && match.winner === "player2"

            return (
              <Card 
                key={match.id} 
                className={`bg-card border-border transition-all hover:border-primary/30 ${
                  isWin ? "border-l-4 border-l-green-500" : 
                  isLoss ? "border-l-4 border-l-destructive" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                          {match.opponent.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground truncate">
                            vs {match.opponent}
                          </span>
                          {getStatusBadge(match.status)}
                          <Badge variant="outline" className="capitalize text-xs">
                            {match.sport}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(match.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {match.time}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {match.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score & Result */}
                    <div className="text-right flex-shrink-0">
                      {match.status === "completed" && (
                        <>
                          {match.score && (
                            <div className="font-mono text-lg font-bold text-foreground">
                              {match.score}
                            </div>
                          )}
                          <div className={`text-sm font-medium ${isWin ? "text-green-400" : "text-destructive"}`}>
                            {isWin ? "Won" : "Lost"}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
