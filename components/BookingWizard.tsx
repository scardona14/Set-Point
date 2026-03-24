"use client";

import { useState } from "react";
import { MapPin, Users, Globe, Lock } from "lucide-react";
import { SportIcon, type SportType } from "./SportIcon";

const SPORTS: SportType[] = ["Padel", "Tennis", "Beach Tennis", "Pickleball"];

const LOCATIONS = [
  { id: 1, name: "Parque Luis A. Ferré", hood: "Isla Grande", dist: "0.2 mi away" },
  { id: 2, name: "Parque Central", hood: "Santurce", dist: "1.5 mi away" },
  { id: 3, name: "Miramar Paddle Club", hood: "Miramar", dist: "0.8 mi away" },
  { id: 4, name: "Condado Beach Courts", hood: "Condado", dist: "2.1 mi away" },
];

export function BookingWizard() {
  const [step, setStep] = useState(1);
  const [sport, setSport] = useState<SportType | null>(null);
  const [location, setLocation] = useState<number | null>(null);
  const [type, setType] = useState<"private" | "open" | null>(null);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));
  const canProceed =
    (step === 1 && sport !== null) ||
    (step === 2 && location !== null) ||
    (step === 3 && type !== null);

  return (
    <div className="max-w-md mx-auto w-full flex flex-col min-h-[70vh]">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-xs font-bold text-muted-foreground">
          <span className={step >= 1 ? "text-primary" : ""}>Sport</span>
          <span className={step >= 2 ? "text-primary" : ""}>Location</span>
          <span className={step >= 3 ? "text-primary" : ""}>Type</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          <div className={`h-full bg-primary transition-all duration-300 w-1/3 ${step >= 1 ? "opacity-100" : "opacity-0"}`} />
          <div className={`h-full bg-primary transition-all duration-300 w-1/3 ${step >= 2 ? "opacity-100" : "opacity-0"} border-l border-background`} />
          <div className={`h-full bg-primary transition-all duration-300 w-1/3 ${step >= 3 ? "opacity-100" : "opacity-0"} border-l border-background`} />
        </div>
      </div>

      {/* Step Components */}
      <div className="flex-1">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-foreground mb-6">What are we playing?</h2>
            <div className="grid grid-cols-2 gap-4">
              {SPORTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSport(s)}
                  className={`p-6 rounded-[--radius] flex flex-col items-center justify-center gap-4 border-2 transition-all ${
                    sport === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-muted-foreground"
                  }`}
                >
                  <SportIcon sport={s} className="h-8 w-8" />
                  <span className="font-bold text-sm tracking-tight">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-foreground mb-6">Choose a court</h2>
            <div className="flex flex-col gap-3">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setLocation(loc.id)}
                  className={`p-4 rounded-[--radius] flex items-center justify-between border-2 transition-all text-left ${
                    location === loc.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-full">
                      <MapPin className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground leading-tight">{loc.name}</h4>
                      <p className="text-sm text-muted-foreground">{loc.hood}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-secondary">{loc.dist}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-black text-foreground mb-6">Who can join?</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setType("open")}
                className={`p-5 rounded-[--radius] flex flex-col gap-2 border-2 transition-all text-left ${
                  type === "open"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3 text-primary">
                  <Globe className="h-6 w-6" />
                  <h4 className="font-bold text-lg">Open Guerrilla</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Post this game to the public feed. Anyone nearby can join and play.
                </p>
              </button>

              <button
                onClick={() => setType("private")}
                className={`p-5 rounded-[--radius] flex flex-col gap-2 border-2 transition-all text-left ${
                  type === "private"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-3 text-secondary">
                  <Lock className="h-6 w-6" />
                  <h4 className="font-bold text-lg">Private Game</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Invite only. Book the court just for you and your friends.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Nav */}
      <div className="mt-8 flex gap-4 pt-4 border-t border-border">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 py-4 text-center rounded-full font-bold text-foreground bg-muted hover:bg-muted/80 transition-colors"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex-1 py-4 text-center rounded-full font-bold transition-all ${
              canProceed
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(191,255,0,0.3)] hover:opacity-90 active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            Next Step
          </button>
        ) : (
          <button
            disabled={!canProceed}
            className={`flex-1 py-4 text-center rounded-full font-bold transition-all ${
              canProceed
                ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(191,255,0,0.3)] hover:opacity-90 active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            Confirm & Book Court
          </button>
        )}
      </div>
    </div>
  );
}
