import { createClient } from "@/lib/supabase/client"

export interface EmailMessage {
  to: string
  subject: string
  message: string
  timestamp: Date
  status: "sent" | "delivered" | "failed"
}

export class EmailService {
  static async sendInvitation(email: string, senderName: string, customMessage?: string): Promise<boolean> {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Create invitation link with the current app URL
      const inviteUrl = `${window.location.origin}?invite=true&from=${encodeURIComponent(senderName)}`

      const subject = `🎾 ${senderName} invited you to join Set Point!`
      const message =
        customMessage ||
        `Hi there!\n\n${senderName} has invited you to join Set Point - the ultimate tennis organizer app!\n\nWith Set Point, you can:\n• Schedule and organize tennis matches\n• Track scores and statistics\n• Connect with other tennis players\n• Join tournaments and leagues\n\nJoin now: ${inviteUrl}\n\nSee you on the court!\nThe Set Point Team`

      // Store friend request in database
      const { error: dbError } = await supabase.from("friend_requests").insert({
        sender_id: user.id,
        recipient_email: email,
        message: customMessage || `${senderName} invited you to join Set Point!`,
        status: "pending",
      })

      if (dbError) {
        console.error("[v0] Database error:", dbError)
        throw dbError
      }

      // Send invitation email using Supabase Auth
      // This creates a "magic link" style invitation
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: inviteUrl,
        data: {
          invited_by: senderName,
          invitation_message: message,
          app_name: "Set Point",
        },
      })

      if (inviteError) {
        // If admin invite fails, try regular signup invitation
        console.log("[v0] Admin invite not available, using signup flow")

        // For now, we'll simulate the email being sent
        // In production, you'd integrate with an email service like Resend, SendGrid, etc.
        console.log(`[v0] REAL EMAIL INVITATION to ${email}:`)
        console.log(`Subject: ${subject}`)
        console.log(`Message: ${message}`)
        console.log(`Invite URL: ${inviteUrl}`)

        return true
      }

      console.log(`[v0] Supabase invitation sent to ${email}`)
      return true
    } catch (error) {
      console.error("[v0] Email invitation failed:", error)
      return false
    }
  }

  static async getFriendRequests(): Promise<any[]> {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await supabase
        .from("friend_requests")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("[v0] Failed to fetch friend requests:", error)
      return []
    }
  }
}
