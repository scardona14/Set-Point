"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bell, Calendar, Users, Trophy, Clock, Settings, Check, X, AlertCircle } from "lucide-react"

interface Notification {
  id: string
  type: "match_reminder" | "friend_request" | "score_update" | "match_invitation" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable?: boolean
  data?: any
}

interface NotificationCenterProps {
  onFriendRequestAction?: (notificationId: string, action: "accept" | "reject") => void
  onMatchInvitationAction?: (notificationId: string, action: "accept" | "reject") => void
  currentUserId?: string
}

// Default notification settings
const defaultSettings = {
  matchReminders: true,
  friendRequests: true,
  scoreUpdates: true,
  matchInvitations: true,
  emailNotifications: false,
  pushNotifications: true,
}

export function NotificationCenter({
  onFriendRequestAction,
  onMatchInvitationAction,
  currentUserId,
}: NotificationCenterProps) {
  // Notifications are stored in component state - will be moved to Supabase when notifications table is created
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState(defaultSettings)
  const [showSettings, setShowSettings] = useState(false)

  // Reset notifications when user changes
  useEffect(() => {
    if (!currentUserId) {
      setNotifications([])
      setSettings(defaultSettings)
    }
  }, [currentUserId])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const handleFriendRequest = (notificationId: string, action: "accept" | "reject") => {
    onFriendRequestAction?.(notificationId, action)
    removeNotification(notificationId)
  }

  const handleMatchInvitation = (notificationId: string, action: "accept" | "reject") => {
    onMatchInvitationAction?.(notificationId, action)
    removeNotification(notificationId)
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "match_reminder":
        return <Clock className="h-4 w-4 text-primary" />
      case "friend_request":
        return <Users className="h-4 w-4 text-secondary" />
      case "score_update":
        return <Trophy className="h-4 w-4 text-accent" />
      case "match_invitation":
        return <Calendar className="h-4 w-4 text-primary" />
      case "system":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString()
  }

  // Mock reminder system - in a real app, this would be handled by a backend service
  useEffect(() => {
    if (!currentUserId) return

    const interval = setInterval(() => {
      // Check for upcoming matches and create reminders
      const now = new Date()
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000)

      // This would typically check against actual match data
      // For demo purposes, we'll occasionally add a new reminder
      if (Math.random() < 0.1 && settings.matchReminders) {
        // 10% chance every interval
        const newReminder: Notification = {
          id: Date.now().toString(),
          type: "match_reminder",
          title: "Upcoming Match",
          message: "Don't forget about your match in 2 hours!",
          timestamp: new Date(),
          read: false,
        }

        setNotifications((prev) => [newReminder, ...prev])
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [settings.matchReminders, currentUserId])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        {showSettings ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Notification Settings</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="match-reminders">Match Reminders</Label>
                <Switch
                  id="match-reminders"
                  checked={settings.matchReminders}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, matchReminders: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="friend-requests">Friend Requests</Label>
                <Switch
                  id="friend-requests"
                  checked={settings.friendRequests}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, friendRequests: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="score-updates">Score Updates</Label>
                <Switch
                  id="score-updates"
                  checked={settings.scoreUpdates}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, scoreUpdates: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="match-invitations">Match Invitations</Label>
                <Switch
                  id="match-invitations"
                  checked={settings.matchInvitations}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, matchInvitations: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Notifications</h4>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors ${
                      !notification.read ? "bg-primary/5 border-primary/20" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm">{notification.title}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>

                          {notification.actionable && (
                            <div className="flex gap-2">
                              {notification.type === "friend_request" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleFriendRequest(notification.id, "accept")
                                    }}
                                    className="h-7 px-3 bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleFriendRequest(notification.id, "reject")
                                    }}
                                    className="h-7 px-3"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}

                              {notification.type === "match_invitation" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMatchInvitation(notification.id, "accept")
                                    }}
                                    className="h-7 px-3"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMatchInvitation(notification.id, "reject")
                                    }}
                                    className="h-7 px-3"
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Decline
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
