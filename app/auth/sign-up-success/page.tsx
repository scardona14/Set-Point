"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#2a2a2a] border-[#3a3a3a]">
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
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-[#ccff00]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
          <CardDescription className="text-gray-400">
            We&apos;ve sent you a confirmation link. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or try signing up again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/auth/login" className="w-full">
            <Button className="w-full bg-[#ccff00] text-black hover:bg-[#b8e600] font-semibold">
              Back to Sign In
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
