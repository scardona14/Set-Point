import { MapPin, Users, Clock } from "lucide-react";
import { SportIcon, type SportType } from "./SportIcon";

export interface GuerrillaCardProps {
  sport: SportType;
  locationName: string;
  distance: string;
  playersJoined: number;
  totalSlots: number;
  timeRemaining: string;
}

export function GuerrillaCard({
  sport,
  locationName,
  distance,
  playersJoined,
  totalSlots,
  timeRemaining,
}: GuerrillaCardProps) {
  const isFull = playersJoined >= totalSlots;

  return (
    <div className="bg-card border border-border p-4 rounded-[--radius] flex flex-col gap-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-muted p-2 rounded-full text-foreground">
            <SportIcon sport={sport} className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground leading-tight">{sport}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" /> {locationName}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
            {distance}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className={isFull ? "text-destructive" : "text-foreground"}>
              {playersJoined}/{totalSlots}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{timeRemaining}</span>
          </div>
        </div>
        <button
          className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
            isFull
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95"
          }`}
          disabled={isFull}
        >
          {isFull ? "Full" : "Join"}
        </button>
      </div>
    </div>
  );
}
