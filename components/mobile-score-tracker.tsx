"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Plus, RotateCcw, Save } from "lucide-react"

interface MobileScoreTrackerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  matchId: string
  player1Name: string
  player2Name: string
  onSaveScore: (matchId: string, finalScore: string, winner: string) => void
}

export function MobileScoreTracker({
  open,
  onOpenChange,
  matchId,
  player1Name,
  player2Name,
  onSaveScore,
}: MobileScoreTrackerProps) {
  const [player1Score, setPlayer1Score] = useState({ sets: [0], games: [0], points: 0 })
  const [player2Score, setPlayer2Score] = useState({ sets: [0], games: [0], points: 0 })
  const [currentSet, setCurrentSet] = useState(0)
  const [matchComplete, setMatchComplete] = useState(false)
  const [winner, setWinner] = useState("")

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50) // Short vibration for button presses
    }
  }

  const pointValues = ["0", "15", "30", "40"]

  const addPoint = (player: 1 | 2) => {
    triggerHaptic()

    if (matchComplete) return

    if (player === 1) {
      setPlayer1Score((prev) => {
        const newScore = { ...prev }
        if (newScore.points < 3) {
          newScore.points++
        } else if (newScore.points === 3 && player2Score.points < 3) {
          // Win game
          newScore.games[currentSet]++
          newScore.points = 0
          setPlayer2Score((p2) => ({ ...p2, points: 0 }))
          checkSetWin(newScore.games[currentSet], player2Score.games[currentSet], 1)
        } else if (newScore.points === 3 && player2Score.points === 3) {
          // Advantage
          newScore.points = 4
        } else if (newScore.points === 4 && player2Score.points === 3) {
          // Win from advantage
          newScore.games[currentSet]++
          newScore.points = 0
          setPlayer2Score((p2) => ({ ...p2, points: 0 }))
          checkSetWin(newScore.games[currentSet], player2Score.games[currentSet], 1)
        } else if (newScore.points === 4 && player2Score.points === 4) {
          // Back to deuce
          newScore.points = 3
          setPlayer2Score((p2) => ({ ...p2, points: 3 }))
        }
        return newScore
      })
    } else {
      setPlayer2Score((prev) => {
        const newScore = { ...prev }
        if (newScore.points < 3) {
          newScore.points++
        } else if (newScore.points === 3 && player1Score.points < 3) {
          // Win game
          newScore.games[currentSet]++
          newScore.points = 0
          setPlayer1Score((p1) => ({ ...p1, points: 0 }))
          checkSetWin(player1Score.games[currentSet], newScore.games[currentSet], 2)
        } else if (newScore.points === 3 && player1Score.points === 3) {
          // Advantage
          newScore.points = 4
        } else if (newScore.points === 4 && player1Score.points === 3) {
          // Win from advantage
          newScore.games[currentSet]++
          newScore.points = 0
          setPlayer1Score((p1) => ({ ...p1, points: 0 }))
          checkSetWin(player1Score.games[currentSet], newScore.games[currentSet], 2)
        } else if (newScore.points === 4 && player1Score.points === 4) {
          // Back to deuce
          newScore.points = 3
          setPlayer1Score((p1) => ({ ...p1, points: 3 }))
        }
        return newScore
      })
    }
  }

  const checkSetWin = (p1Games: number, p2Games: number, lastPointWinner: 1 | 2) => {
    if ((p1Games >= 6 && p1Games - p2Games >= 2) || p1Games === 7) {
      // Player 1 wins set
      if (currentSet < 2) {
        setCurrentSet(currentSet + 1)
        setPlayer1Score((prev) => ({ ...prev, games: [...prev.games, 0] }))
        setPlayer2Score((prev) => ({ ...prev, games: [...prev.games, 0] }))
      }
      checkMatchWin([...player1Score.sets, 1], [...player2Score.sets, 0])
    } else if ((p2Games >= 6 && p2Games - p1Games >= 2) || p2Games === 7) {
      // Player 2 wins set
      if (currentSet < 2) {
        setCurrentSet(currentSet + 1)
        setPlayer1Score((prev) => ({ ...prev, games: [...prev.games, 0] }))
        setPlayer2Score((prev) => ({ ...prev, games: [...prev.games, 0] }))
      }
      checkMatchWin([...player1Score.sets, 0], [...player2Score.sets, 1])
    }
  }

  const checkMatchWin = (p1Sets: number[], p2Sets: number[]) => {
    const p1SetsWon = p1Sets.reduce((a, b) => a + b, 0)
    const p2SetsWon = p2Sets.reduce((a, b) => a + b, 0)

    if (p1SetsWon >= 2) {
      setMatchComplete(true)
      setWinner(player1Name)
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]) // Victory vibration pattern
      }
    } else if (p2SetsWon >= 2) {
      setMatchComplete(true)
      setWinner(player2Name)
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100])
      }
    }
  }

  const resetMatch = () => {
    triggerHaptic()
    setPlayer1Score({ sets: [0], games: [0], points: 0 })
    setPlayer2Score({ sets: [0], games: [0], points: 0 })
    setCurrentSet(0)
    setMatchComplete(false)
    setWinner("")
  }

  const saveMatch = () => {
    const finalScore = `${player1Score.games.join("-")} vs ${player2Score.games.join("-")}`
    onSaveScore(matchId, finalScore, winner)
    onOpenChange(false)
  }

  const getPointDisplay = (points: number, opponentPoints: number) => {
    if (points <= 3 && opponentPoints <= 3) {
      if (points === 3 && opponentPoints === 3) return "40"
      return pointValues[points]
    }
    if (points === 4 && opponentPoints === 3) return "AD"
    if (points === 3 && opponentPoints === 4) return "40"
    if (points === 4 && opponentPoints === 4) return "40"
    return pointValues[Math.min(points, 3)]
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="text-center">
            {matchComplete ? `🏆 ${winner} Wins!` : "Live Score Tracking"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-6">
          {/* Score Display */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player 1 */}
            <Card className="bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-center">{player1Name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {getPointDisplay(player1Score.points, player2Score.points)}
                  </div>
                  <div className="text-2xl font-semibold">{player1Score.games[currentSet]}</div>
                </div>
                <div className="flex justify-center gap-1">
                  {player1Score.sets.map((set, index) => (
                    <Badge key={index} variant={set > 0 ? "default" : "outline"}>
                      {player1Score.games[index] || 0}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Player 2 */}
            <Card className="bg-secondary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-center">{player2Name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">
                    {getPointDisplay(player2Score.points, player1Score.points)}
                  </div>
                  <div className="text-2xl font-semibold">{player2Score.games[currentSet]}</div>
                </div>
                <div className="flex justify-center gap-1">
                  {player2Score.sets.map((set, index) => (
                    <Badge key={index} variant={set > 0 ? "default" : "outline"}>
                      {player2Score.games[index] || 0}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button size="lg" className="h-16 text-lg" onClick={() => addPoint(1)} disabled={matchComplete}>
              <Plus className="h-6 w-6 mr-2" />
              {player1Name}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-16 text-lg"
              onClick={() => addPoint(2)}
              disabled={matchComplete}
            >
              <Plus className="h-6 w-6 mr-2" />
              {player2Name}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetMatch} className="flex-1 bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            {matchComplete && (
              <Button onClick={saveMatch} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Match
              </Button>
            )}
          </div>

          {/* Match Info */}
          <div className="text-center text-sm text-muted-foreground">
            Set {currentSet + 1} • Best of 3 Sets
            {matchComplete && (
              <div className="mt-2 text-primary font-semibold">
                Match Complete! Tap "Save Match" to record the result.
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
