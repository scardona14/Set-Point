"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  UserPlus,
  UserMinus,
  Mail,
  Check,
  X,
  Search,
  Trophy,
  Calendar,
  Users,
  Phone,
  AlertTriangle,
} from "lucide-react"
import { SMSService } from "@/lib/sms-service"
import { EmailService } from "@/lib/email-service"

interface Friend {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  status: "active" | "pending-sent" | "pending-received"
  matchesPlayed: number
  lastMatch?: string
  skillLevel?: "Beginner" | "Intermediate" | "Advanced" | "Professional"
}

interface FriendsManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
}

// Friends feature uses client-side state only (demo mode)
// Full persistence would require a friends table in Supabase

export function FriendsManager({ open, onOpenChange, currentUserId }: FriendsManagerProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newFriendContact, setNewFriendContact] = useState("")
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("email")
  const [activeTab, setActiveTab] = useState("friends")

  const activeFriends = friends.filter((f) => f.status === "active")
  const pendingReceived = friends.filter((f) => f.status === "pending-received")
  const pendingSent = friends.filter((f) => f.status === "pending-sent")

  const filteredFriends = activeFriends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (friend.email && friend.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (friend.phone && friend.phone.includes(searchTerm)),
  )

  const handleAddFriend = async () => {
    if (!newFriendContact.trim()) return

    if (contactMethod === "email" && !newFriendContact.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    if (contactMethod === "phone" && !/^\+?[\d\s\-()]+$/.test(newFriendContact)) {
      alert("Please enter a valid phone number")
      return
    }

    const sendingButton = document.querySelector("[data-sending]") as HTMLButtonElement
    if (sendingButton) {
      sendingButton.disabled = true
      sendingButton.textContent = contactMethod === "phone" ? "Sending SMS..." : "Sending Email..."
    }

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: contactMethod === "email" ? newFriendContact.split("@")[0] : `Contact ${newFriendContact.slice(-4)}`,
      ...(contactMethod === "email" ? { email: newFriendContact } : { phone: newFriendContact }),
      status: "pending-sent",
      matchesPlayed: 0,
      skillLevel: "Intermediate",
    }

    try {
      const senderName = "A Set Point player"

      if (contactMethod === "phone") {
        const success = await SMSService.sendInvitation(newFriendContact, senderName)
        if (success) {
          alert(
            `⚠️ DEMO MODE: SMS invitation simulated for ${newFriendContact}!\n\nThis is a demonstration - no real SMS was sent. For real SMS functionality, you would need:\n• SMS service provider (Twilio, AWS SNS)\n• API keys and server setup\n• Phone number verification`,
          )
        } else {
          alert("Demo SMS simulation failed. Friend request still added.")
        }
      } else {
        const success = await EmailService.sendInvitation(newFriendContact, senderName)
        if (success) {
          alert(
            `⚠️ DEMO MODE: Email invitation simulated for ${newFriendContact}!\n\nThis is a demonstration - no real email was sent. For real email functionality, you would need:\n• Email service provider (SendGrid, AWS SES)\n• API keys and server setup\n• Email verification`,
          )
        } else {
          alert("Demo email simulation failed. Friend request still added.")
        }
      }
    } catch (error) {
      console.error("[v0] Invitation sending error:", error)
      alert(
        `${contactMethod === "phone" ? "SMS" : "Email"} service unavailable. Friend request sent without notification.`,
      )
    }

    setFriends((prev) => [...prev, newFriend])
    setNewFriendContact("")

    if (sendingButton) {
      sendingButton.disabled = false
      sendingButton.innerHTML =
        '<svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>Send Request'
    }
  }

  const handleAcceptFriend = (friendId: string) => {
    setFriends((prev) => prev.map((f) => (f.id === friendId ? { ...f, status: "active" as const } : f)))
  }

  const handleRejectFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId))
  }

  const handleRemoveFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId))
  }

  const getSkillLevelColor = (level?: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-blue-100 text-blue-800"
      case "Advanced":
        return "bg-purple-100 text-purple-800"
      case "Professional":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatLastMatch = (dateString?: string) => {
    if (!dateString) return "Never played"
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Manage Tennis Friends</DialogTitle>
          <DialogDescription>
            Connect with other tennis players, send friend requests, and build your tennis network.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Friends ({activeFriends.length})
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Requests ({pendingReceived.length})
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Friend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredFriends.map((friend) => (
                <Card key={friend.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {friend.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{friend.name}</p>
                        {friend.email && <p className="text-sm text-muted-foreground">{friend.email}</p>}
                        {friend.phone && <p className="text-sm text-muted-foreground">{friend.phone}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getSkillLevelColor(friend.skillLevel)}>
                            {friend.skillLevel}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Trophy className="h-3 w-3" />
                            {friend.matchesPlayed} matches
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatLastMatch(friend.lastMatch)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {filteredFriends.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No friends found matching your search."
                    : "No friends yet. Add some friends to get started!"}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {pendingReceived.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Friend Requests</h4>
                  {pendingReceived.map((friend) => (
                    <Card key={friend.id} className="p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                              {friend.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{friend.name}</p>
                            {friend.email && <p className="text-sm text-muted-foreground">{friend.email}</p>}
                            {friend.phone && <p className="text-sm text-muted-foreground">{friend.phone}</p>}
                            <Badge variant="outline" className={getSkillLevelColor(friend.skillLevel)}>
                              {friend.skillLevel}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptFriend(friend.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectFriend(friend.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {pendingSent.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Sent Requests</h4>
                  {pendingSent.map((friend) => (
                    <Card key={friend.id} className="p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              {friend.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{friend.name}</p>
                            {friend.email && <p className="text-sm text-muted-foreground">{friend.email}</p>}
                            {friend.phone && <p className="text-sm text-muted-foreground">{friend.phone}</p>}
                            <Badge variant="outline">Pending</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectFriend(friend.id)}
                          className="text-muted-foreground"
                        >
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {pendingReceived.length === 0 && pendingSent.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No pending friend requests.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800">Demo Mode</p>
                  <p className="text-yellow-700">
                    SMS and email invitations are simulated for demonstration. Recipients won't receive actual messages.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  variant={contactMethod === "email" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContactMethod("email")}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email (Demo)
                </Button>
                <Button
                  variant={contactMethod === "phone" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setContactMethod("phone")}
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Phone (Demo)
                </Button>
              </div>

              <div>
                <Label htmlFor="friend-contact">
                  {contactMethod === "email" ? "Friend's Email Address" : "Friend's Phone Number"}
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="friend-contact"
                    type={contactMethod === "email" ? "email" : "tel"}
                    placeholder={contactMethod === "email" ? "friend@example.com" : "+1 (555) 123-4567"}
                    value={newFriendContact}
                    onChange={(e) => setNewFriendContact(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
                  />
                  <Button onClick={handleAddFriend} disabled={!newFriendContact.trim()} data-sending>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How friend invitations work:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Enter your friend's {contactMethod === "email" ? "email address" : "phone number"}</li>
                  <li>
                    • <strong>Demo:</strong> Invitation is simulated (not actually sent)
                  </li>
                  <li>
                    • <strong>Production:</strong> Would send real {contactMethod === "phone" ? "SMS" : "email"}{" "}
                    invitation
                  </li>
                  <li>• Friends can then create accounts and accept your invitation</li>
                  <li>• Build your tennis network and schedule matches together</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
