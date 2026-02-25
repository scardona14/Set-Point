"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Plus, X, Users, MapPin, Play, ChevronLeft, Trash2 } from "lucide-react"

type Sport = "tennis" | "pickleball" | "padel"

interface TournamentMatch {
  id: string
  player1: string
  player2: string
  court: string
  round: number
  status: "scheduled" | "in-progress" | "completed"
  score?: string
  winner?: string
}

interface Tournament {
  id: string
  name: string
  sport: Sport
  format: "single-elimination" | "round-robin"
  matchFormat: "singles" | "doubles"
  courts: string[]
  players: string[]
  matches: TournamentMatch[]
  status: "setup" | "active" | "completed"
  createdAt: string
}

interface TournamentManagerProps {
  sport: Sport
  currentUser: { id: string; name: string }
}

const sportLabels: Record<Sport, string> = {
  tennis: "Tennis",
  pickleball: "Pickleball",
  padel: "Padel",
}

export function TournamentManager({ sport, currentUser }: TournamentManagerProps) {
  const STORAGE_KEY = `setpoint_tournaments_${currentUser.id}`

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [activeMatch, setActiveMatch] = useState<TournamentMatch | null>(null)
  const [matchScore, setMatchScore] = useState({ p1: "", p2: "" })

  // Form state
  const [newTournament, setNewTournament] = useState({
    name: "",
    format: "single-elimination" as "single-elimination" | "round-robin",
    matchFormat: "singles" as "singles" | "doubles",
    courtCount: 2,
    courtNames: ["Court 1", "Court 2"],
  })
  const [newPlayerName, setNewPlayerName] = useState("")
  const [playerList, setPlayerList] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setTournaments(JSON.parse(saved))
      } catch {
        setTournaments([])
      }
    }
  }, [STORAGE_KEY])

  const saveTournaments = (updated: Tournament[]) => {
    setTournaments(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const sportTournaments = tournaments.filter((t) => t.sport === sport)

  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim()
    if (trimmed && !playerList.includes(trimmed)) {
      setPlayerList((prev) => [...prev, trimmed])
      setNewPlayerName("")
    }
  }

  const handleRemovePlayer = (name: string) => {
    setPlayerList((prev) => prev.filter((p) => p !== name))
  }

  const handleCourtCountChange = (count: number) => {
    const courts = Array.from({ length: count }, (_, i) => `Court ${i + 1}`)
    setNewTournament((prev) => ({ ...prev, courtCount: count, courtNames: courts }))
  }

  const handleCourtNameChange = (index: number, name: string) => {
    setNewTournament((prev) => {
      const updated = [...prev.courtNames]
      updated[index] = name
      return { ...prev, courtNames: updated }
    })
  }

  const generateMatches = (players: string[], format: string, courts: string[]): TournamentMatch[] => {
    const matches: TournamentMatch[] = []

    if (format === "round-robin") {
      let matchIndex = 0
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          matches.push({
            id: `match-${Date.now()}-${matchIndex}`,
            player1: players[i],
            player2: players[j],
            court: courts[matchIndex % courts.length],
            round: 1,
            status: "scheduled",
          })
          matchIndex++
        }
      }
    } else {
      // Single elimination
      const shuffled = [...players].sort(() => Math.random() - 0.5)
      // Pad to power of 2
      const size = Math.pow(2, Math.ceil(Math.log2(shuffled.length)))
      while (shuffled.length < size) shuffled.push("BYE")

      let round = 1
      let matchIndex = 0
      for (let i = 0; i < shuffled.length; i += 2) {
        matches.push({
          id: `match-${Date.now()}-${matchIndex}`,
          player1: shuffled[i],
          player2: shuffled[i + 1],
          court: courts[matchIndex % courts.length],
          round,
          status: shuffled[i] === "BYE" || shuffled[i + 1] === "BYE" ? "completed" : "scheduled",
          winner:
            shuffled[i] === "BYE"
              ? shuffled[i + 1]
              : shuffled[i + 1] === "BYE"
                ? shuffled[i]
                : undefined,
          score:
            shuffled[i] === "BYE" || shuffled[i + 1] === "BYE" ? "BYE" : undefined,
        })
        matchIndex++
      }
    }

    return matches
  }

  const handleCreateTournament = () => {
    if (!newTournament.name.trim() || playerList.length < 2) return

    const matches = generateMatches(playerList, newTournament.format, newTournament.courtNames)

    const tournament: Tournament = {
      id: Date.now().toString(),
      name: newTournament.name.trim(),
      sport,
      format: newTournament.format,
      matchFormat: newTournament.matchFormat,
      courts: newTournament.courtNames,
      players: [...playerList],
      matches,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    saveTournaments([tournament, ...tournaments])
    setShowCreateDialog(false)
    setNewTournament({
      name: "",
      format: "single-elimination",
      matchFormat: "singles",
      courtCount: 2,
      courtNames: ["Court 1", "Court 2"],
    })
    setPlayerList([])
    setSelectedTournament(tournament)
  }

  const handleScoreSubmit = () => {
    if (!activeMatch || !selectedTournament || !matchScore.p1 || !matchScore.p2) return

    const p1Score = parseInt(matchScore.p1)
    const p2Score = parseInt(matchScore.p2)
    if (isNaN(p1Score) || isNaN(p2Score) || p1Score === p2Score) return

    const winner = p1Score > p2Score ? activeMatch.player1 : activeMatch.player2
    const scoreStr = `${matchScore.p1}-${matchScore.p2}`

    const updatedMatches = selectedTournament.matches.map((m) =>
      m.id === activeMatch.id ? { ...m, status: "completed" as const, score: scoreStr, winner } : m,
    )

    // For single elimination, check if next round matches need to be generated
    if (selectedTournament.format === "single-elimination") {
      const currentRound = activeMatch.round
      const roundMatches = updatedMatches.filter((m) => m.round === currentRound)
      const allRoundComplete = roundMatches.every((m) => m.status === "completed")

      if (allRoundComplete) {
        const winners = roundMatches.map((m) => m.winner!).filter(Boolean)
        if (winners.length >= 2) {
          for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
              updatedMatches.push({
                id: `match-${Date.now()}-next-${i}`,
                player1: winners[i],
                player2: winners[i + 1],
                court: selectedTournament.courts[Math.floor(i / 2) % selectedTournament.courts.length],
                round: currentRound + 1,
                status: "scheduled",
              })
            }
          }
        }
      }
    }

    const allComplete = updatedMatches.every((m) => m.status === "completed")
    const updatedTournament: Tournament = {
      ...selectedTournament,
      matches: updatedMatches,
      status: allComplete ? "completed" : "active",
    }

    const updatedTournaments = tournaments.map((t) => (t.id === selectedTournament.id ? updatedTournament : t))
    saveTournaments(updatedTournaments)
    setSelectedTournament(updatedTournament)
    setShowScoreDialog(false)
    setActiveMatch(null)
    setMatchScore({ p1: "", p2: "" })
  }

  const handleDeleteTournament = (tournamentId: string) => {
    const updated = tournaments.filter((t) => t.id !== tournamentId)
    saveTournaments(updated)
    if (selectedTournament?.id === tournamentId) {
      setSelectedTournament(null)
    }
  }

  const getRoundRobinStandings = (tournament: Tournament) => {
    const standings: Record<string, { wins: number; losses: number; points: number }> = {}
    tournament.players.forEach((p) => {
      standings[p] = { wins: 0, losses: 0, points: 0 }
    })
    tournament.matches
      .filter((m) => m.status === "completed" && m.winner)
      .forEach((m) => {
        if (standings[m.winner!]) {
          standings[m.winner!].wins++
          standings[m.winner!].points += 3
        }
        const loser = m.winner === m.player1 ? m.player2 : m.player1
        if (standings[loser]) {
          standings[loser].losses++
        }
      })
    return Object.entries(standings).sort(([, a], [, b]) => b.points - a.points)
  }

  // Detail view for a selected tournament
  if (selectedTournament) {
    const rounds = [...new Set(selectedTournament.matches.map((m) => m.round))].sort((a, b) => a - b)
    const isRoundRobin = selectedTournament.format === "round-robin"

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedTournament(null)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h2 className="font-serif text-2xl font-bold">{selectedTournament.name}</h2>
              <p className="text-sm text-muted-foreground">
                {sportLabels[selectedTournament.sport]} - {selectedTournament.format === "round-robin" ? "Round Robin" : "Single Elimination"} - {selectedTournament.matchFormat}
              </p>
            </div>
          </div>
          <Badge variant={selectedTournament.status === "completed" ? "secondary" : "default"} className="capitalize">
            {selectedTournament.status}
          </Badge>
        </div>

        {/* Court Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Court Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTournament.courts.map((court) => {
                const courtMatch = selectedTournament.matches.find(
                  (m) => m.court === court && (m.status === "scheduled" || m.status === "in-progress"),
                )
                return (
                  <div key={court} className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-sm">{court}</p>
                      <Badge variant={courtMatch ? "default" : "outline"} className="text-xs">
                        {courtMatch ? "Active" : "Open"}
                      </Badge>
                    </div>
                    {courtMatch ? (
                      <p className="text-xs text-muted-foreground">
                        {courtMatch.player1} vs {courtMatch.player2}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">No match assigned</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Round Robin Standings */}
        {isRoundRobin && (
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-5 text-sm font-medium text-muted-foreground px-3 pb-2 border-b">
                  <div className="col-span-2">Player</div>
                  <div className="text-center">W</div>
                  <div className="text-center">L</div>
                  <div className="text-center">Pts</div>
                </div>
                {getRoundRobinStandings(selectedTournament).map(([player, stats], i) => (
                  <div key={player} className="grid grid-cols-5 items-center p-3 rounded-lg bg-muted/30">
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}.</span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {player
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{player}</span>
                    </div>
                    <div className="text-center font-semibold text-green-600">{stats.wins}</div>
                    <div className="text-center font-semibold text-red-600">{stats.losses}</div>
                    <div className="text-center font-bold">{stats.points}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matches by Round */}
        {rounds.map((round) => {
          const roundMatches = selectedTournament.matches.filter((m) => m.round === round)
          return (
            <Card key={round}>
              <CardHeader>
                <CardTitle className="font-serif">
                  {isRoundRobin ? "All Matches" : `Round ${round}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {roundMatches.map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[120px]">
                          <p className={`font-semibold text-sm ${match.winner === match.player1 ? "text-primary" : ""}`}>
                            {match.player1}
                          </p>
                          <p className="text-xs text-muted-foreground my-1">vs</p>
                          <p className={`font-semibold text-sm ${match.winner === match.player2 ? "text-primary" : ""}`}>
                            {match.player2}
                          </p>
                        </div>
                        <div className="text-left">
                          <Badge variant="outline" className="text-xs mb-1">
                            {match.court}
                          </Badge>
                          {match.score && (
                            <p className="text-sm font-mono font-semibold">{match.score}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            match.status === "completed"
                              ? "secondary"
                              : match.status === "in-progress"
                                ? "default"
                                : "outline"
                          }
                          className="capitalize text-xs"
                        >
                          {match.status.replace("-", " ")}
                        </Badge>
                        {match.status === "scheduled" && match.player1 !== "BYE" && match.player2 !== "BYE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveMatch(match)
                              setMatchScore({ p1: "", p2: "" })
                              setShowScoreDialog(true)
                            }}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Score
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Score Entry Dialog */}
        <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="font-serif">Enter Match Score</DialogTitle>
              <DialogDescription>
                {activeMatch?.player1} vs {activeMatch?.player2}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{activeMatch?.player1}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={matchScore.p1}
                    onChange={(e) => setMatchScore((prev) => ({ ...prev, p1: e.target.value }))}
                  />
                </div>
                <div className="text-center text-lg font-bold text-muted-foreground pb-2">vs</div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{activeMatch?.player2}</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={matchScore.p2}
                    onChange={(e) => setMatchScore((prev) => ({ ...prev, p2: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the final score. The player with the higher score will be recorded as the winner.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScoreDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleScoreSubmit}
                disabled={!matchScore.p1 || !matchScore.p2 || matchScore.p1 === matchScore.p2}
              >
                Save Score
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Tournament list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">{sportLabels[sport]} Tournaments</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Tournament
        </Button>
      </div>

      {sportTournaments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">No Tournaments Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first {sportLabels[sport].toLowerCase()} tournament, add players, and assign matches to courts.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sportTournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1" onClick={() => setSelectedTournament(tournament)}>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-lg font-semibold">{tournament.name}</h3>
                      <Badge variant={tournament.status === "completed" ? "secondary" : "default"} className="capitalize text-xs">
                        {tournament.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {tournament.players.length} players
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {tournament.courts.length} courts
                      </span>
                      <span className="capitalize">{tournament.format.replace("-", " ")}</span>
                      <span className="capitalize">{tournament.matchFormat}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {tournament.matches.filter((m) => m.status === "completed").length}/{tournament.matches.length} matches completed
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTournament(tournament.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Tournament Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Create {sportLabels[sport]} Tournament</DialogTitle>
            <DialogDescription>Set up a new tournament with players and court assignments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Tournament Name */}
            <div className="space-y-2">
              <Label htmlFor="tournamentName">Tournament Name</Label>
              <Input
                id="tournamentName"
                placeholder={`e.g., Weekend ${sportLabels[sport]} Championship`}
                value={newTournament.name}
                onChange={(e) => setNewTournament((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Format */}
            <div className="space-y-2">
              <Label>Tournament Format</Label>
              <RadioGroup
                value={newTournament.format}
                onValueChange={(v) =>
                  setNewTournament((prev) => ({ ...prev, format: v as "single-elimination" | "round-robin" }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single-elimination" id="single-elim" />
                  <Label htmlFor="single-elim" className="font-normal cursor-pointer">
                    Single Elimination
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="round-robin" id="round-robin" />
                  <Label htmlFor="round-robin" className="font-normal cursor-pointer">
                    Round Robin
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Match Format */}
            <div className="space-y-2">
              <Label>Match Format</Label>
              <RadioGroup
                value={newTournament.matchFormat}
                onValueChange={(v) =>
                  setNewTournament((prev) => ({ ...prev, matchFormat: v as "singles" | "doubles" }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="singles" id="t-singles" />
                  <Label htmlFor="t-singles" className="font-normal cursor-pointer">
                    Singles
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doubles" id="t-doubles" />
                  <Label htmlFor="t-doubles" className="font-normal cursor-pointer">
                    Doubles
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Courts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Courts Available</Label>
                <Select
                  value={newTournament.courtCount.toString()}
                  onValueChange={(v) => handleCourtCountChange(parseInt(v))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} court{n > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {newTournament.courtNames.map((name, i) => (
                  <Input
                    key={i}
                    placeholder={`Court ${i + 1}`}
                    value={name}
                    onChange={(e) => handleCourtNameChange(i, e.target.value)}
                  />
                ))}
              </div>
            </div>

            {/* Players */}
            <div className="space-y-3">
              <Label>Players ({playerList.length} added)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddPlayer()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {playerList.length > 0 && (
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                  {playerList.map((player) => (
                    <Badge key={player} variant="secondary" className="flex items-center gap-1 py-1.5 px-3">
                      {player}
                      <button
                        type="button"
                        onClick={() => handleRemovePlayer(player)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {playerList.length < 2 && (
                <p className="text-xs text-muted-foreground">Add at least 2 players to create a tournament.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTournament} disabled={!newTournament.name.trim() || playerList.length < 2}>
              Create Tournament
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
