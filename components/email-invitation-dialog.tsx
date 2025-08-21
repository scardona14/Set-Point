"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { EmailService } from "@/lib/email-service"

interface EmailInvitationDialogProps {
  currentUser: {
    id: string
    name: string
    email: string
  }
  onInvitationSent?: (email: string, inviteCode: string) => void
}

export function EmailInvitationDialog({ currentUser, onInvitationSent }: EmailInvitationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const emailService = EmailService.getInstance()

  const handleSendInvitation = async () => {
    if (!email.trim()) return

    setIsLoading(true)
    setStatus("idle")
    setErrorMessage("")

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Generate unique invite code
      const inviteCode = emailService.generateInviteCode()

      // Send email invitation
      const result = await emailService.sendFriendInvitation({
        to: email,
        from: currentUser.email,
        fromName: currentUser.name,
        inviteCode,
        message: message.trim() || undefined,
      })

      if (result.success) {
        setStatus("success")
        onInvitationSent?.(email, inviteCode)

        // Reset form after success
        setTimeout(() => {
          setEmail("")
          setMessage("")
          setStatus("idle")
          setIsOpen(false)
        }, 2000)
      } else {
        throw new Error(result.error || "Failed to send invitation")
      }
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send invitation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendInvitation()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Mail className="h-4 w-4" />
          Invite by Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-cyan-600" />
            Invite Friend to Set Point
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Friend's Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="friend@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Hey! Want to play some tennis? Join me on Set Point!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}

          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Invitation sent successfully!
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSendInvitation} disabled={!email.trim() || isLoading} className="flex-1 gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1">
            <li>• Your friend will receive an email with a special invitation link</li>
            <li>• They can click the link to join Set Point and automatically become your friend</li>
            <li>• You'll be notified when they accept the invitation</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
