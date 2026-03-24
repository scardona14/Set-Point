import { TournamentBracket } from "@/components/TournamentBracket";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

export default function TournamentPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[720px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </Link>
            <h1 className="font-mono text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" /> Bracket
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto pt-10 pb-20">
        <div className="px-4 mb-8">
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter">
            San Juan Open
          </h2>
          <p className="text-muted-foreground font-medium mt-1">
            Men's Singles • Padel
          </p>
        </div>
        
        {/* We keep the bracket full width, but contained within max-w-[720px] container */}
        <div className="bg-card/50 border-y border-border py-12 px-4 shadow-inner overflow-hidden w-full">
          <TournamentBracket />
        </div>
      </main>
    </div>
  );
}
