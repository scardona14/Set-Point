import { Trophy } from "lucide-react";

interface Player {
  id: string;
  name: string;
  score?: number;
}

interface Match {
  id: string;
  player1: Player;
  player2: Player;
  winnerId?: string;
}

const ROUNDS = [
  {
    title: "Round of 8",
    matches: [
      {
        id: "QF1",
        player1: { id: "p1", name: "Carlos Rivera", score: 6 },
        player2: { id: "p2", name: "Luis Torres", score: 4 },
        winnerId: "p1",
      },
      {
        id: "QF2",
        player1: { id: "p3", name: "Mia Colón", score: 7 },
        player2: { id: "p4", name: "Sofia Ortiz", score: 5 },
        winnerId: "p3",
      },
      {
        id: "QF3",
        player1: { id: "p5", name: "Diego Ramos", score: 2 },
        player2: { id: "p6", name: "Javier Cruz", score: 6 },
        winnerId: "p6",
      },
      {
        id: "QF4",
        player1: { id: "p7", name: "Ana Morales", score: 6 },
        player2: { id: "p8", name: "Valentina Vega", score: 1 },
        winnerId: "p7",
      },
    ],
  },
  {
    title: "Semifinals",
    matches: [
      {
        id: "SF1",
        player1: { id: "p1", name: "Carlos Rivera", score: 6 },
        player2: { id: "p3", name: "Mia Colón", score: 4 },
        winnerId: "p1",
      },
      {
        id: "SF2",
        player1: { id: "p6", name: "Javier Cruz", score: 2 },
        player2: { id: "p7", name: "Ana Morales", score: 6 },
        winnerId: "p7",
      },
    ],
  },
  {
    title: "Final",
    matches: [
      {
        id: "F1",
        player1: { id: "p1", name: "Carlos Rivera", score: 7 },
        player2: { id: "p7", name: "Ana Morales", score: 5 },
        winnerId: "p1", // Carlos is the Champion
      },
    ],
  },
];

export function TournamentBracket() {
  return (
    <div className="w-full overflow-x-auto pb-8 scrollbar-hide">
      <div className="flex min-w-max gap-8 px-4">
        {ROUNDS.map((round, rIdx) => (
          <div key={round.title} className="flex flex-col relative" style={{ width: "240px" }}>
            <h3 className="text-secondary font-black text-sm uppercase tracking-wider mb-6 text-center">
              {round.title}
            </h3>
            
            <div className="flex flex-col flex-1 justify-around gap-4" style={{ minHeight: `${ROUNDS[0].matches.length * 100}px` }}>
              {round.matches.map((match, mIdx) => (
                <div key={match.id} className="relative flex items-center">
                  
                  {/* Connector Lines */}
                  {rIdx > 0 && (
                    <div className="absolute -left-8 w-8 border-b-2 border-primary" style={{ top: '50%' }} />
                  )}
                  {rIdx < ROUNDS.length - 1 && (
                    <>
                      <div className="absolute -right-4 w-4 border-b-2 border-primary" style={{ top: '50%' }} />
                      <div 
                        className={`absolute -right-4 w-[2px] bg-primary`}
                        style={{ 
                          height: 'calc(100% + 2rem)', 
                          top: mIdx % 2 === 0 ? '50%' : 'auto',
                          bottom: mIdx % 2 === 1 ? '50%' : 'auto'
                        }} 
                      />
                    </>
                  )}

                  {/* Match Card */}
                  <div className="bg-card border border-border rounded-lg w-full flex flex-col overflow-hidden relative z-10 shadow-md">
                    <PlayerRow player={match.player1} isWinner={match.winnerId === match.player1.id} />
                    <div className="w-full h-[1px] bg-border" />
                    <PlayerRow player={match.player2} isWinner={match.winnerId === match.player2.id} />
                  </div>
                  
                  {rIdx === ROUNDS.length - 1 && (
                    <div className="absolute -right-12 mt-1 bg-primary text-primary-foreground p-2 rounded-full shadow-[0_0_15px_rgba(191,255,0,0.5)]">
                      <Trophy className="h-6 w-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerRow({ player, isWinner }: { player: Player; isWinner: boolean }) {
  return (
    <div className={`px-3 py-2 flex justify-between items-center ${isWinner ? 'bg-primary/5' : ''}`}>
      <span className={`text-sm truncate font-semibold pr-2 ${isWinner ? 'text-primary' : 'text-foreground'}`}>
        {player.name}
      </span>
      {player.score !== undefined && (
        <span className={`text-sm font-black w-6 text-center rounded ${isWinner ? 'text-primary' : 'text-muted-foreground'}`}>
          {player.score}
        </span>
      )}
    </div>
  );
}
