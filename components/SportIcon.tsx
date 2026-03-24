import { Circle, CircleDot, CircleDashed, Dribbble } from "lucide-react";

export type SportType = "Padel" | "Tennis" | "Beach Tennis" | "Pickleball";

interface SportIconProps {
  sport: SportType;
  className?: string;
}

export function SportIcon({ sport, className = "" }: SportIconProps) {
  const getIcon = () => {
    switch (sport) {
      case "Padel":
        return <Dribbble className={className} />;
      case "Tennis":
        return <CircleDot className={className} />;
      case "Beach Tennis":
        return <CircleDashed className={className} />;
      case "Pickleball":
        return <Circle className={className} />;
      default:
        return <CircleDot className={className} />;
    }
  };

  return getIcon();
}
