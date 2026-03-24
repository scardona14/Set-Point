"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Users, LayoutDashboard, Clock } from "lucide-react";

export default function TournamentPage() {
  const [category, setCategory] = useState("San Juan Open");
  const [courts, setCourts] = useState<number>(2);
  const [playersText, setPlayersText] = useState("Carlos Rivera\nMia Colón\nLuis Torres\nSofia Ortiz\nDiego Ramos\nJavier Cruz\nAna Morales");
  const [drawData, setDrawData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const playersList = playersText.split("\n").map(p => p.trim()).filter(p => p.length > 0);
    
    try {
      const res = await fetch("/api/tournament/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          courts,
          players: playersList,
        }),
      });
      const data = await res.json();
      setDrawData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[720px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </Link>
            <h1 className="font-mono text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-secondary" /> Organizer Mode
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto pt-8 px-4 flex flex-col gap-10">
        
        {!drawData ? (
          <section className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-black text-foreground">Setup Tournament</h2>
              <p className="text-muted-foreground text-sm mt-1">Configure courts and players to compute the draw.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tournament Name</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="bg-background border border-border rounded-lg p-3 text-foreground font-medium outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Available Courts</label>
                <input 
                  type="number" 
                  min="1"
                  value={courts}
                  onChange={e => setCourts(Number(e.target.value))}
                  className="bg-background border border-border rounded-lg p-3 text-foreground font-medium outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                  <span>Players (1 per line)</span>
                  <span className="text-primary">{playersText.split("\n").filter(p => p.trim()).length} total</span>
                </label>
                <textarea 
                  value={playersText}
                  onChange={e => setPlayersText(e.target.value)}
                  rows={8}
                  className="bg-background border border-border rounded-lg p-3 text-foreground font-medium outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="mt-2 bg-primary text-primary-foreground py-4 rounded-xl font-black text-lg uppercase tracking-tight hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(191,255,0,0.15)] disabled:opacity-50"
            >
              {loading ? "Computing..." : "Generate Draw"}
            </button>
          </section>
        ) : (
          <section className="animate-in fade-in zoom-in-95 duration-300 flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">{drawData.category}</h2>
                <p className="text-muted-foreground font-medium mt-1">Round 1 • {drawData.total_players} Players • {drawData.byes_count} Byes</p>
              </div>
              <button 
                onClick={() => setDrawData(null)}
                className="text-sm font-bold text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Edit Setup
              </button>
            </div>

            {/* Live Courts */}
            <div className="flex flex-col gap-4">
              <h3 className="text-primary font-black text-lg flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" /> Live on Court
              </h3>
              {drawData.round_1_matches.length === 0 ? (
                <p className="text-muted-foreground italic text-sm p-4 bg-muted/50 rounded-lg">No matches playing.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {drawData.round_1_matches.map((m: any) => (
                    <div key={m.id} className="bg-card border-2 border-primary/20 rounded-xl overflow-hidden relative shadow-lg">
                      <div className="bg-primary px-4 py-1.5 flex justify-between items-center text-primary-foreground">
                        <span className="font-bold text-sm tracking-widest uppercase">{m.court}</span>
                        <span className="font-medium text-xs tracking-wider flex items-center gap-1 animate-pulse"><div className="h-1.5 w-1.5 rounded-full bg-red-500" /> LIVE</span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-foreground font-semibold">
                          <span>{m.p1}</span>
                          <div className="h-4 w-4 rounded bg-muted"></div>
                        </div>
                        <div className="h-[1px] w-full bg-border" />
                        <div className="flex items-center justify-between text-foreground font-semibold">
                          <span>{m.p2 || "TBD"}</span>
                          <div className="h-4 w-4 rounded bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Waiting List */}
            <div className="flex flex-col gap-4 mt-4">
              <h3 className="text-muted-foreground font-black text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" /> Queue (Waiting for Court)
              </h3>
              {drawData.waiting_list.length === 0 ? (
                <p className="text-muted-foreground italic text-sm p-4 bg-muted/50 rounded-lg">Queue is empty. Everyone is playing.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {drawData.waiting_list.map((m: any, idx: number) => (
                    <div key={m.id} className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
                      <div className="bg-muted h-10 w-10 rounded-full flex items-center justify-center font-bold text-foreground shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm flex items-center justify-between">
                          <span>{m.p1}</span>
                          <span className="text-muted-foreground font-normal italic text-xs mx-2">vs</span>
                          <span>{m.p2 || "TBD"}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Byes */}
            {drawData.byes_list.length > 0 && (
              <div className="flex flex-col gap-4 mt-4 opacity-70">
                <h3 className="text-muted-foreground font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4" /> Passed to Round 2 (Byes)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {drawData.byes_list.map((p: string) => (
                    <span key={p} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold border border-border">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
          </section>
        )}

      </main>
    </div>
  );
}

