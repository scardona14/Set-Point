"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md bg-[#2a2a2a]/90 border-[#3a3a3a] backdrop-blur-sm relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/app-icon.png"
              alt="Set Point Logo"
              width={80}
              height={80}
              className="rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.3)]"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              {submitted ? "Check your email" : "Forgot password?"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {submitted
                ? `We sent a reset link to ${email}`
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </div>
        </CardHeader>

        {submitted ? (
          <CardContent className="space-y-4">
            <div className="flex justify-center py-4">
              <div className="h-16 w-16 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-[#ccff00]" />
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#1a1a1a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:border-[#ccff00] focus:ring-[#ccff00]/20"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ccff00] text-black hover:bg-[#b8e600] font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </CardFooter>
          </form>
        )}

        <CardFooter className="justify-center pb-6">
          <Link
            href="/auth/login"
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#ccff00] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
