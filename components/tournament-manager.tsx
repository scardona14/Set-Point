"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, Calendar, MapPin, DollarSign, Plus, Play, Crown, Medal } from "lucide-react"
import { TournamentService, type Tournament, type League } from "@/lib/tournament-service"

interface TournamentManagerProps {
  currentUser: {
    id: string
    name: string
    email: string
    skillLevel?: string
  }
}

export function TournamentManager({ currentUser }: TournamentManagerProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("tournaments")

  const tournamentService = TournamentService.getInstance()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setTournaments(tournamentService.getTournaments())
    setLeagues(tournamentService.getLeagues())
  }

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const tournament = tournamentService.createTournament({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      status: "upcoming",
      maxParticipants: Number.parseInt(formData.get("maxParticipants") as string),
      startDate: formData.get("startDate") as string,
      createdBy: currentUser.id,
      location: formData.get("location") as string,
      prize: formData.get("prize") as string,
      entryFee: formData.get("entryFee") ? Number.parseFloat(formData.get("entryFee") as string) : undefined,
      rules: formData.get("rules") as string,
    })

    // Auto-join creator
    tournamentService.joinTournament(tournament.id, {
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      skillLevel: currentUser.skillLevel || "intermediate",
    })

    loadData()
    setIsCreateDialogOpen(false)
  }

  const handleCreateLeague = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    const league = tournamentService.createLeague({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      season: formData.get("season") as string,
      status: "upcoming",
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      createdBy: currentUser.id,
    })

    // Auto-join creator
    tournamentService.joinLeague(league.id, {
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      skillLevel: currentUser.skillLevel || "intermediate",
    })

    loadData()
    setIsCreateDialogOpen(false)
  }

  const handleJoinTournament = (tournamentId: string) => {
    const success = tournamentService.joinTournament(tournamentId, {
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      skillLevel: currentUser.skillLevel || "intermediate",
    })

    if (success) {
      loadData()
    }
  }

  const handleStartTournament = (tournamentId: string) => {
    tournamentService.generateBracket(tournamentId)
    loadData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "in-progress":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tournaments & Leagues</h2>
          <p className="text-muted-foreground">Compete in tournaments and join leagues</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Tournament or League</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="tournament" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tournament">Tournament</TabsTrigger>
                <TabsTrigger value="league">League</TabsTrigger>
              </TabsList>

              <TabsContent value="tournament">
                <form onSubmit={handleCreateTournament} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tournament Name</Label>
                      <Input id="name" name="name" placeholder="Summer Championship" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tournament Type</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single-elimination">Single Elimination</SelectItem>
                          <SelectItem value="double-elimination">Double Elimination</SelectItem>
                          <SelectItem value="round-robin">Round Robin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Tournament description..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Max Participants</Label>
                      <Input
                        id="maxParticipants"
                        name="maxParticipants"
                        type="number"
                        min="2"
                        max="64"
                        defaultValue="8"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" name="startDate" type="date" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" placeholder="Tennis Club Name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="entryFee">Entry Fee ($)</Label>
                      <Input id="entryFee" name="entryFee" type="number" min="0" step="0.01" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prize">Prize</Label>
                    <Input id="prize" name="prize" placeholder="Trophy + $100" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rules">Rules & Notes</Label>
                    <Textarea id="rules" name="rules" placeholder="Special rules or additional information..." />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Tournament
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="league">
                <form onSubmit={handleCreateLeague} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="league-name">League Name</Label>
                      <Input id="league-name" name="name" placeholder="Spring League 2024" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="season">Season</Label>
                      <Input id="season" name="season" placeholder="Spring 2024" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="league-description">Description</Label>
                    <Textarea id="league-description" name="description" placeholder="League description..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="league-startDate">Start Date</Label>
                      <Input id="league-startDate" name="startDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" name="endDate" type="date" required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Create League
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="leagues">Leagues</TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-4">
          {tournaments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Tournaments Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first tournament to get started!</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tournament
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tournament.name}</CardTitle>
                        <CardDescription>{tournament.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(tournament.status)}>{tournament.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {tournament.currentParticipants}/{tournament.maxParticipants} players
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </div>

                    {tournament.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {tournament.location}
                      </div>
                    )}

                    {tournament.prize && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Crown className="h-4 w-4" />
                        {tournament.prize}
                      </div>
                    )}

                    {tournament.entryFee && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />${tournament.entryFee}
                      </div>
                    )}

                    <div className="pt-2">
                      {tournament.participants.some((p) => p.userId === currentUser.id) ? (
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <Medal className="h-3 w-3" />
                            Registered
                          </Badge>
                          {tournament.status === "upcoming" && tournament.currentParticipants >= 2 && (
                            <Button size="sm" onClick={() => handleStartTournament(tournament.id)}>
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      ) : tournament.currentParticipants < tournament.maxParticipants &&
                        tournament.status === "upcoming" ? (
                        <Button size="sm" onClick={() => handleJoinTournament(tournament.id)} className="w-full">
                          Join Tournament
                        </Button>
                      ) : (
                        <Badge variant="outline">Full</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leagues" className="space-y-4">
          {leagues.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Leagues Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first league to get started!</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create League
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league) => (
                <Card key={league.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{league.name}</CardTitle>
                        <CardDescription>{league.season}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(league.status)}>{league.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {league.participants.length} players
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(league.startDate).toLocaleDateString()} -{" "}
                      {new Date(league.endDate).toLocaleDateString()}
                    </div>

                    {league.standings.length > 0 && (
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Current Leader:</p>
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{league.standings[0]?.name}</span>
                          <Badge variant="secondary">{league.standings[0]?.points} pts</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
