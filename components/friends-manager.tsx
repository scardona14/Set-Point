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
import { UserPlus, UserMinus, Mail, Check, X, Search, Trophy, Calendar, Users } from "lucide-react"

interface Friend {
  id: string
  name: string
  email: string
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

const getUserFriends = (userId: string): Friend[] => {
  const key = `setpoint_user_${userId}`
  const userData = localStorage.getItem(key)
  if (userData) {
    const parsed = JSON.parse(userData)
    return parsed.friends || []
  }
  return []
}

const saveUserFriends = (userId: string, friends: Friend[]) => {
  const key = `setpoint_user_${userId}`
  const existingData = localStorage.getItem(key)
  const userData = existingData ? JSON.parse(existingData) : {}
  userData.friends = friends
  localStorage.setItem(key, JSON.stringify(userData))
}

export function FriendsManager({ open, onOpenChange, currentUserId }: FriendsManagerProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newFriendEmail, setNewFriendEmail] = useState("")
  const [activeTab, setActiveTab] = useState("friends")

  useEffect(() => {
    if (currentUserId) {
      const userFriends = getUserFriends(currentUserId)
      setFriends(userFriends)
    }
  }, [currentUserId])

  useEffect(() => {
    if (currentUserId && friends.length >= 0) {
      saveUserFriends(currentUserId, friends)
    }
  }, [friends, currentUserId])

  const activeFriends = friends.filter((f) => f.status === "active")
  const pendingReceived = friends.filter((f) => f.status === "pending-received")
  const pendingSent = friends.filter((f) => f.status === "pending-sent")

  const filteredFriends = activeFriends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddFriend = () => {
    if (!newFriendEmail.trim()) return

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: newFriendEmail.split("@")[0], // Mock name from email
      email: newFriendEmail,
      status: "pending-sent",
      matchesPlayed: 0,
      skillLevel: "Intermediate",
    }

    setFriends((prev) => [...prev, newFriend])
    setNewFriendEmail("")
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
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Friends List */}
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
                        <p className="text-sm text-muted-foreground">{friend.email}</p>
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
              {/* Received Requests */}
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
                            <p className="text-sm text-muted-foreground">{friend.email}</p>
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

              {/* Sent Requests */}
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
                            <p className="text-sm text-muted-foreground">{friend.email}</p>
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
              <div>
                <Label htmlFor="friend-email">Friend's Email Address</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="friend-email"
                    type="email"
                    placeholder="friend@example.com"
                    value={newFriendEmail}
                    onChange={(e) => setNewFriendEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddFriend()}
                  />
                  <Button onClick={handleAddFriend} disabled={!newFriendEmail.trim()}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How to add friends:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Enter your friend's email address</li>
                  <li>• They'll receive a friend request notification</li>
                  <li>• Once accepted, you can schedule matches together</li>
                  <li>• Build your tennis network and track your games</li>
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
