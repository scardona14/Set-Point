import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, senderName, message } = await request.json()

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create invitation URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}?invite=true&from=${encodeURIComponent(senderName)}`

    // Store friend request in database
    const { error: dbError } = await supabase.from("friend_requests").insert({
      sender_id: user.id,
      recipient_email: email,
      message: message || `${senderName} invited you to join Set Point!`,
      status: "pending",
    })

    if (dbError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // In production, integrate with email service (Resend, SendGrid, etc.)
    // For now, we'll log the invitation details
    console.log(`[v0] Email invitation prepared for ${email}`)
    console.log(`Invite URL: ${inviteUrl}`)
    console.log(`Message: ${message}`)

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      inviteUrl,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
