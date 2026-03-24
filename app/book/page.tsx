import { BookingWizard } from "@/components/BookingWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BookPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Link>
          <h1 className="font-mono text-xl font-bold text-foreground">New Game</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <BookingWizard />
      </main>
    </div>
  );
}
