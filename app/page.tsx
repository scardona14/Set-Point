import { User } from "lucide-react";
import { GuerrillaCard } from "@/components/GuerrillaCard";
import type { SportType } from "@/components/SportIcon";
import Link from "next/link";

const MOCK_GAMES = [
  {
    id: "g1",
    sport: "Padel" as SportType,
    locationName: "Miramar Paddle Club",
    distance: "0.8 mi away",
    playersJoined: 3,
    totalSlots: 4,
    timeRemaining: "Starts in 22 min",
  },
  {
    id: "g2",
    sport: "Tennis" as SportType,
    locationName: "Parque Central",
    distance: "1.5 mi away",
    playersJoined: 2,
    totalSlots: 4,
    timeRemaining: "Starts in 45 min",
  },
  {
    id: "g3",
    sport: "Beach Tennis" as SportType,
    locationName: "Condado Beach Courts",
    distance: "2.1 mi away",
    playersJoined: 4,
    totalSlots: 4,
    timeRemaining: "Starts in 1 hr",
  },
  {
    id: "g4",
    sport: "Pickleball" as SportType,
    locationName: "Parque Luis A. Ferré",
    distance: "0.2 mi away",
    playersJoined: 1,
    totalSlots: 4,
    timeRemaining: "Starts in 2 hrs",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-mono text-2xl font-black text-primary tracking-tighter italic">
            SET<span className="text-foreground">POINT</span>
          </h1>
          <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center border border-border overflow-hidden">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 flex flex-col gap-8">
        {/* Hero CTA */}
        <section>
          <Link href="/book" className="block w-full">
            <div className="bg-primary hover:bg-primary/90 transition-colors rounded-2xl p-6 text-primary-foreground shadow-[0_0_30px_rgba(191,255,0,0.15)] flex flex-col items-center justify-center gap-2 group active:scale-[0.98]">
              <span className="text-3xl group-hover:-translate-y-1 transition-transform">📍</span>
              <h2 className="text-xl font-black text-center uppercase tracking-tight">
                Find a Game Near Me
              </h2>
              <p className="text-sm font-medium opacity-80">
                Last Minute Guerrilla
              </p>
            </div>
          </Link>
          <div className="mt-4 flex justify-center">
            <Link href="/tournament" className="text-sm font-bold text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-border transition-colors">
              View Tournament Brackets
            </Link>
          </div>
        </section>

        {/* Feed */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔥</span>
            <h2 className="text-lg font-black text-foreground">Live Games Near You</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {MOCK_GAMES.map((game) => (
              <GuerrillaCard key={game.id} {...game} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
