"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Trophy, RotateCcw, Save } from "lucide-react"

interface ScoreState {
  player1: {
    sets: number[]
    currentSet: number
    currentGame: number
  }
  player2: {
    sets: number[]
    currentSet: number
    currentGame: number
  }
  currentSetIndex: number
  matchComplete: boolean
  winner: "player1" | "player2" | null
}

interface ScoreTrackerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matchId: string
  player1Name: string
  player2Name: string
  onSaveScore: (matchId: string, finalScore: string, winner: string) => void
}

const TENNIS_SCORES = ["0", "15", "30", "40", "AD"]

export function ScoreTracker({
  open,
  onOpenChange,
  matchId,
  player1Name,
  player2Name,
  onSaveScore,
}: ScoreTrackerProps) {
  const MATCH_PROGRESS_KEY = `setpoint_match_progress_${matchId}`

  const [score, setScore] = useState<ScoreState>({
    player1: { sets: [0], currentSet: 0, currentGame: 0 },
    player2: { sets: [0], currentSet: 0, currentGame: 0 },
    currentSetIndex: 0,
    matchComplete: false,
    winner: null,
  })

  const [history, setHistory] = useState<ScoreState[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const savedProgress = localStorage.getItem(MATCH_PROGRESS_KEY)

      if (savedProgress) {
        try {
          const { score: savedScore, history: savedHistory } = JSON.parse(savedProgress)
          setScore(savedScore)
          setHistory(savedHistory)
        } catch (error) {
          console.error("[v0] Error loading match progress:", error)
          const initialScore = {
            player1: { sets: [0], currentSet: 0, currentGame: 0 },
            player2: { sets: [0], currentSet: 0, currentGame: 0 },
            currentSetIndex: 0,
            matchComplete: false,
            winner: null,
          }
          setScore(initialScore)
          setHistory([initialScore])
        }
      } else {
        const initialScore = {
          player1: { sets: [0], currentSet: 0, currentGame: 0 },
          player2: { sets: [0], currentSet: 0, currentGame: 0 },
          currentSetIndex: 0,
          matchComplete: false,
          winner: null,
        }
        setScore(initialScore)
        setHistory([initialScore])
      }
    }
  }, [open, matchId])

  useEffect(() => {
    if (open && !score.matchComplete) {
      localStorage.setItem(MATCH_PROGRESS_KEY, JSON.stringify({ score, history }))
    }
  }, [score, history, open, matchId, score.matchComplete])

  const addPoint = (player: "player1" | "player2") => {
    if (score.matchComplete) return

    setHistory((prev) => [...prev, score])

    setScore((prevScore) => {
      const newScore = { ...prevScore }
      const currentPlayer = newScore[player]
      const opponent = newScore[player === "player1" ? "player2" : "player1"]

      currentPlayer.currentGame++

      if (currentPlayer.currentGame >= 4) {
        if (opponent.currentGame <= 2) {
          currentPlayer.sets[newScore.currentSetIndex]++
          currentPlayer.currentGame = 0
          opponent.currentGame = 0
        } else if (currentPlayer.currentGame - opponent.currentGame >= 2) {
          currentPlayer.sets[newScore.currentSetIndex]++
          currentPlayer.currentGame = 0
          opponent.currentGame = 0
        }
      }

      const p1Games = newScore.player1.sets[newScore.currentSetIndex]
      const p2Games = newScore.player2.sets[newScore.currentSetIndex]

      if ((p1Games >= 6 && p1Games - p2Games >= 2) || p1Games === 7) {
        newScore.player1.sets.push(0)
        newScore.player2.sets.push(0)
        newScore.currentSetIndex++
      } else if ((p2Games >= 6 && p2Games - p1Games >= 2) || p2Games === 7) {
        newScore.player1.sets.push(0)
        newScore.player2.sets.push(0)
        newScore.currentSetIndex++
      }

      const p1SetsWon = newScore.player1.sets
        .slice(0, -1)
        .filter((s) => s > newScore.player2.sets[newScore.player1.sets.indexOf(s)]).length
      const p2SetsWon = newScore.player2.sets
        .slice(0, -1)
        .filter((s) => s > newScore.player1.sets[newScore.player2.sets.indexOf(s)]).length

      if (p1SetsWon >= 2) {
        newScore.matchComplete = true
        newScore.winner = "player1"
      } else if (p2SetsWon >= 2) {
        newScore.matchComplete = true
        newScore.winner = "player2"
      }

      return newScore
    })
  }

  const undoLastPoint = () => {
    if (history.length > 1) {
      const previousScore = history[history.length - 1]
      setScore(previousScore)
      setHistory((prev) => prev.slice(0, -1))
    }
  }

  const resetMatch = () => {
    const initialScore = {
      player1: { sets: [0], currentSet: 0, currentGame: 0 },
      player2: { sets: [0], currentSet: 0, currentGame: 0 },
      currentSetIndex: 0,
      matchComplete: false,
      winner: null,
    }
    setScore(initialScore)
    setHistory([initialScore])
  }

  const formatGameScore = (gameScore: number) => {
    if (gameScore >= 4) {
      return gameScore === 4 ? "AD" : "40"
    }
    return TENNIS_SCORES[gameScore] || "0"
  }

  const formatFinalScore = () => {
    const completedSets = score.player1.sets.slice(0, -1)
    return completedSets
      .map((p1Games, index) => {
        const p2Games = score.player2.sets[index]
        return `${p1Games}-${p2Games}`
      })
      .join(", ")
  }

  const handleSaveMatch = async () => {
    if (score.matchComplete && score.winner) {
      setIsSaving(true)

      try {
        const finalScore = formatFinalScore()
        const winner = score.winner

        onSaveScore(matchId, finalScore, winner)

        localStorage.removeItem(MATCH_PROGRESS_KEY)

        await new Promise((resolve) => setTimeout(resolve, 100))

        onOpenChange(false)

        setIsSaving(false)
      } catch (error) {
        console.error("[v0] Error saving match:", error)
        setIsSaving(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Live Score Tracking</DialogTitle>
          <DialogDescription>
            Track the live score for your tennis match. Tap the + buttons to add points.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Game Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center font-serif">Current Game</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Player 1 */}
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {player1Name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm mb-2">{player1Name}</p>
                  <div className="text-4xl font-bold font-mono mb-2">{formatGameScore(score.player1.currentGame)}</div>
                  <Button
                    size="sm"
                    onClick={() => addPoint("player1")}
                    disabled={score.matchComplete}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Point
                  </Button>
                </div>

                {/* VS */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">VS</div>
                </div>

                {/* Player 2 */}
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarFallback className="bg-secondary/10 text-secondary font-semibold text-lg">
                      {player2Name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm mb-2">{player2Name}</p>
                  <div className="text-4xl font-bold font-mono mb-2">{formatGameScore(score.player2.currentGame)}</div>
                  <Button
                    size="sm"
                    onClick={() => addPoint("player2")}
                    disabled={score.matchComplete}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Point
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Set Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center font-serif">Set Scores</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[200px] overflow-y-auto">
              {score.player1.sets.map((p1Games, setIndex) => {
                const p2Games = score.player2.sets[setIndex] || 0
                const isCurrentSet = setIndex === score.currentSetIndex
                const isCompletedSet = setIndex < score.currentSetIndex

                return (
                  <div key={setIndex} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <Badge variant={isCurrentSet ? "default" : "secondary"}>Set {setIndex + 1}</Badge>
                      {isCurrentSet && <Badge variant="outline">Current</Badge>}
                    </div>
                    <div className="flex items-center gap-8 font-mono text-lg font-semibold">
                      <span className={p1Games > p2Games && isCompletedSet ? "text-primary" : ""}>{p1Games}</span>
                      <span>-</span>
                      <span className={p2Games > p1Games && isCompletedSet ? "text-primary" : ""}>{p2Games}</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Match Status */}
          {score.matchComplete && (
            <Card className="border-primary">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold mb-2">Match Complete!</h3>
                <p className="text-lg mb-2">
                  <span className="font-semibold">{score.winner === "player1" ? player1Name : player2Name}</span> wins!
                </p>
                <p className="text-muted-foreground font-mono">{formatFinalScore()}</p>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={undoLastPoint}
              disabled={history.length <= 1 || isSaving}
              className="flex-1 bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button variant="outline" onClick={resetMatch} className="flex-1 bg-transparent" disabled={isSaving}>
              Reset Match
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Close
          </Button>
          {score.matchComplete && (
            <Button onClick={handleSaveMatch} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Result"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
