export interface SMSMessage {
  to: string
  message: string
  timestamp: Date
  status: "sent" | "delivered" | "failed"
}

export class SMSService {
  private static sentMessages: SMSMessage[] = []

  static async sendInvitation(phoneNumber: string, senderName: string): Promise<boolean> {
    try {
      // Mock SMS sending - in production, this would use Twilio, AWS SNS, etc.
      const message = `🎾 ${senderName} invited you to join Set Point - the ultimate tennis organizer! Download and organize matches, track scores, and connect with tennis players. Get started: [Your App URL]`

      const smsMessage: SMSMessage = {
        to: phoneNumber,
        message,
        timestamp: new Date(),
        status: "sent",
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store message for demo purposes
      this.sentMessages.push(smsMessage)

      // Simulate successful delivery
      setTimeout(() => {
        smsMessage.status = "delivered"
      }, 2000)

      console.log(`[v0] DEMO SMS (not actually sent) to ${phoneNumber}: ${message}`)
      return true
    } catch (error) {
      console.error("[v0] SMS sending failed:", error)
      return false
    }
  }

  static getSentMessages(): SMSMessage[] {
    return this.sentMessages
  }

  static getMessageStatus(phoneNumber: string): SMSMessage | undefined {
    return this.sentMessages.find((msg) => msg.to === phoneNumber)
  }
}
