// Email service for sending friend invitations
interface EmailInvitation {
  to: string
  from: string
  fromName: string
  inviteCode: string
  message?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Mock email service - replace with real service like Resend, SendGrid, or Nodemailer
export class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendFriendInvitation(invitation: EmailInvitation): Promise<EmailResponse> {
    try {
      // In a real app, this would call your email service API
      const emailTemplate = this.generateInvitationEmail(invitation)

      // Mock API call - replace with actual email service
      await this.mockEmailSend(invitation.to, emailTemplate)

      // Store invitation in localStorage for demo purposes
      this.storeInvitation(invitation)

      return { success: true, messageId: `msg_${Date.now()}` }
    } catch (error) {
      console.error("Failed to send email invitation:", error)
      return { success: false, error: "Failed to send invitation email" }
    }
  }

  private generateInvitationEmail(invitation: EmailInvitation): string {
    const inviteUrl = `${window.location.origin}?invite=${invitation.inviteCode}`

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Set Point Tennis Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0891b2;">🎾 Set Point</h1>
            <h2 style="color: #334155;">You're invited to play tennis!</h2>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>${invitation.fromName}</strong> has invited you to join Set Point - the ultimate tennis match organizer!</p>
            
            ${invitation.message ? `<p style="font-style: italic; color: #64748b;">"${invitation.message}"</p>` : ""}
            
            <p>With Set Point, you can:</p>
            <ul style="color: #475569;">
              <li>Organize tennis matches with friends</li>
              <li>Track live scores during games</li>
              <li>Keep match history and statistics</li>
              <li>Connect with other tennis players</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Accept Invitation & Join Set Point
            </a>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 14px;">
            <p>Or copy and paste this link: <br>
            <a href="${inviteUrl}" style="color: #0891b2;">${inviteUrl}</a></p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          
          <div style="text-align: center; color: #94a3b8; font-size: 12px;">
            <p>This invitation was sent by ${invitation.fromName} (${invitation.from})</p>
            <p>Set Point - Your Ultimate Tennis Organizer</p>
          </div>
        </body>
      </html>
    `
  }

  private async mockEmailSend(to: string, template: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log(`[v0] Demo email invitation sent to: ${to}`)
    console.log(`[v0] In a real app, this would send via email service like Resend or SendGrid`)
  }

  private storeInvitation(invitation: EmailInvitation): void {
    const invitations = this.getPendingInvitations()
    invitations.push({
      ...invitation,
      sentAt: new Date().toISOString(),
      status: "sent",
    })
    localStorage.setItem("setpoint_email_invitations", JSON.stringify(invitations))
  }

  getPendingInvitations(): any[] {
    try {
      const stored = localStorage.getItem("setpoint_email_invitations")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  generateInviteCode(): string {
    return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
