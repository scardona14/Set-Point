import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/tennis-ball-realistic.png"
            alt="Set Point Logo"
            width={64}
            height={64}
            className="rounded-full mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground">Set Point</h1>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>
              Something went wrong during authentication. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">Try Again</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
