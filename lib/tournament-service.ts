// Tournament and League Management Service
export interface Tournament {
  id: string
  name: string
  description: string
  type: "single-elimination" | "double-elimination" | "round-robin" | "league"
  status: "upcoming" | "in-progress" | "completed"
  maxParticipants: number
  currentParticipants: number
  participants: TournamentParticipant[]
  matches: TournamentMatch[]
  startDate: string
  endDate?: string
  createdBy: string
  createdAt: string
  prize?: string
  entryFee?: number
  location?: string
  rules?: string
}

export interface TournamentParticipant {
  id: string
  userId: string
  name: string
  email: string
  skillLevel: string
  registeredAt: string
  status: "registered" | "confirmed" | "eliminated" | "winner"
  seed?: number
}

export interface TournamentMatch {
  id: string
  tournamentId: string
  round: number
  matchNumber: number
  player1Id?: string
  player2Id?: string
  player1Name?: string
  player2Name?: string
  winnerId?: string
  score?: string
  status: "pending" | "in-progress" | "completed"
  scheduledDate?: string
  completedAt?: string
}

export interface League {
  id: string
  name: string
  description: string
  season: string
  status: "upcoming" | "active" | "completed"
  participants: LeagueParticipant[]
  matches: LeagueMatch[]
  standings: LeagueStanding[]
  startDate: string
  endDate: string
  createdBy: string
  createdAt: string
}

export interface LeagueParticipant {
  id: string
  userId: string
  name: string
  email: string
  skillLevel: string
  joinedAt: string
}

export interface LeagueMatch {
  id: string
  leagueId: string
  player1Id: string
  player2Id: string
  player1Name: string
  player2Name: string
  winnerId?: string
  score?: string
  status: "scheduled" | "in-progress" | "completed"
  scheduledDate: string
  completedAt?: string
  points: { player1: number; player2: number }
}

export interface LeagueStanding {
  userId: string
  name: string
  matchesPlayed: number
  wins: number
  losses: number
  points: number
  winPercentage: number
  rank: number
}

export class TournamentService {
  private static instance: TournamentService
  private readonly TOURNAMENTS_KEY = "setpoint_tournaments"
  private readonly LEAGUES_KEY = "setpoint_leagues"

  static getInstance(): TournamentService {
    if (!TournamentService.instance) {
      TournamentService.instance = new TournamentService()
    }
    return TournamentService.instance
  }

  // Tournament Management
  createTournament(
    tournament: Omit<Tournament, "id" | "createdAt" | "currentParticipants" | "participants" | "matches">,
  ): Tournament {
    const newTournament: Tournament = {
      ...tournament,
      id: `tournament_${Date.now()}`,
      createdAt: new Date().toISOString(),
      currentParticipants: 0,
      participants: [],
      matches: [],
    }

    const tournaments = this.getTournaments()
    tournaments.push(newTournament)
    this.saveTournaments(tournaments)
    return newTournament
  }

  getTournaments(): Tournament[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.TOURNAMENTS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  getTournament(id: string): Tournament | null {
    const tournaments = this.getTournaments()
    return tournaments.find((t) => t.id === id) || null
  }

  joinTournament(
    tournamentId: string,
    participant: Omit<TournamentParticipant, "id" | "registeredAt" | "status">,
  ): boolean {
    const tournaments = this.getTournaments()
    const tournament = tournaments.find((t) => t.id === tournamentId)

    if (!tournament || tournament.currentParticipants >= tournament.maxParticipants) {
      return false
    }

    const newParticipant: TournamentParticipant = {
      ...participant,
      id: `participant_${Date.now()}`,
      registeredAt: new Date().toISOString(),
      status: "registered",
    }

    tournament.participants.push(newParticipant)
    tournament.currentParticipants++
    this.saveTournaments(tournaments)
    return true
  }

  generateBracket(tournamentId: string): TournamentMatch[] {
    const tournament = this.getTournament(tournamentId)
    if (!tournament || tournament.participants.length < 2) return []

    const participants = [...tournament.participants].sort(() => Math.random() - 0.5) // Shuffle
    const matches: TournamentMatch[] = []
    let matchNumber = 1

    if (tournament.type === "single-elimination") {
      // Create first round matches
      for (let i = 0; i < participants.length; i += 2) {
        if (i + 1 < participants.length) {
          matches.push({
            id: `match_${Date.now()}_${matchNumber}`,
            tournamentId,
            round: 1,
            matchNumber: matchNumber++,
            player1Id: participants[i].userId,
            player2Id: participants[i + 1].userId,
            player1Name: participants[i].name,
            player2Name: participants[i + 1].name,
            status: "pending",
          })
        }
      }

      // Generate subsequent rounds
      let currentRoundMatches = matches.length
      let round = 2
      while (currentRoundMatches > 1) {
        const nextRoundMatches = Math.ceil(currentRoundMatches / 2)
        for (let i = 0; i < nextRoundMatches; i++) {
          matches.push({
            id: `match_${Date.now()}_${matchNumber}`,
            tournamentId,
            round,
            matchNumber: matchNumber++,
            status: "pending",
          })
        }
        currentRoundMatches = nextRoundMatches
        round++
      }
    }

    // Update tournament with matches
    const tournaments = this.getTournaments()
    const tournamentIndex = tournaments.findIndex((t) => t.id === tournamentId)
    if (tournamentIndex >= 0) {
      tournaments[tournamentIndex].matches = matches
      tournaments[tournamentIndex].status = "in-progress"
      this.saveTournaments(tournaments)
    }

    return matches
  }

  // League Management
  createLeague(league: Omit<League, "id" | "createdAt" | "participants" | "matches" | "standings">): League {
    const newLeague: League = {
      ...league,
      id: `league_${Date.now()}`,
      createdAt: new Date().toISOString(),
      participants: [],
      matches: [],
      standings: [],
    }

    const leagues = this.getLeagues()
    leagues.push(newLeague)
    this.saveLeagues(leagues)
    return newLeague
  }

  getLeagues(): League[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.LEAGUES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  joinLeague(leagueId: string, participant: Omit<LeagueParticipant, "id" | "joinedAt">): boolean {
    const leagues = this.getLeagues()
    const league = leagues.find((l) => l.id === leagueId)

    if (!league) return false

    const newParticipant: LeagueParticipant = {
      ...participant,
      id: `participant_${Date.now()}`,
      joinedAt: new Date().toISOString(),
    }

    league.participants.push(newParticipant)
    this.saveLeagues(leagues)
    this.updateLeagueStandings(leagueId)
    return true
  }

  updateLeagueStandings(leagueId: string): void {
    const leagues = this.getLeagues()
    const league = leagues.find((l) => l.id === leagueId)
    if (!league) return

    const standings: LeagueStanding[] = league.participants.map((participant) => {
      const matches = league.matches.filter(
        (m) => (m.player1Id === participant.userId || m.player2Id === participant.userId) && m.status === "completed",
      )

      const wins = matches.filter((m) => m.winnerId === participant.userId).length
      const losses = matches.length - wins
      const points = wins * 3 + losses * 1 // 3 points for win, 1 for participation

      return {
        userId: participant.userId,
        name: participant.name,
        matchesPlayed: matches.length,
        wins,
        losses,
        points,
        winPercentage: matches.length > 0 ? (wins / matches.length) * 100 : 0,
        rank: 0, // Will be calculated after sorting
      }
    })

    // Sort by points, then by win percentage
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.winPercentage - a.winPercentage
    })

    // Assign ranks
    standings.forEach((standing, index) => {
      standing.rank = index + 1
    })

    // Update league
    const leagueIndex = leagues.findIndex((l) => l.id === leagueId)
    if (leagueIndex >= 0) {
      leagues[leagueIndex].standings = standings
      this.saveLeagues(leagues)
    }
  }

  private saveTournaments(tournaments: Tournament[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.TOURNAMENTS_KEY, JSON.stringify(tournaments))
  }

  private saveLeagues(leagues: League[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.LEAGUES_KEY, JSON.stringify(leagues))
  }
}
