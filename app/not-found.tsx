import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-4xl font-black mb-2 tracking-tighter">404</h2>
      <p className="text-xl font-semibold mb-2">Page Not Found</p>
      <p className="text-muted-foreground mb-6 max-w-md">
        The page you are looking for doesn't exist or has been moved. Let's get you back on the court.
      </p>
      <Link href="/">
        <Button size="lg">Return Home</Button>
      </Link>
    </div>
  )
}
