// Real-time Notification Service
export interface Notification {
  id: string
  userId: string
  type:
    | "match_reminder"
    | "friend_request"
    | "tournament_update"
    | "achievement"
    | "match_invitation"
    | "score_update"
    | "system"
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
  scheduledFor?: string
  priority: "low" | "medium" | "high" | "urgent"
  category: "matches" | "social" | "tournaments" | "achievements" | "system"
  actionUrl?: string
  actionLabel?: string
}

export interface NotificationPreferences {
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  matchReminders: boolean
  friendRequests: boolean
  tournamentUpdates: boolean
  achievements: boolean
  socialActivity: boolean
  reminderTiming: number // minutes before match
  quietHours: {
    enabled: boolean
    start: string // "22:00"
    end: string // "08:00"
  }
}

export class NotificationService {
  private static instance: NotificationService
  private readonly NOTIFICATIONS_KEY = "setpoint_notifications"
  private readonly PREFERENCES_KEY = "setpoint_notification_preferences"
  private notificationListeners: ((notifications: Notification[]) => void)[] = []
  private pushSubscription: PushSubscription | null = null

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  constructor() {
    this.initializePushNotifications()
    this.startNotificationScheduler()
  }

  // Core Notification Management
  async createNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false,
    }

    const notifications = this.getUserNotifications(notification.userId)
    notifications.unshift(newNotification)

    // Keep only last 100 notifications
    const trimmedNotifications = notifications.slice(0, 100)
    this.saveUserNotifications(notification.userId, trimmedNotifications)

    // Check if should show browser notification
    await this.maybeShowBrowserNotification(newNotification)

    // Notify listeners
    this.notifyListeners(notification.userId, trimmedNotifications)

    return newNotification
  }

  getUserNotifications(userId: string): Notification[] {
    if (typeof window === "undefined") return []
    const key = `${this.NOTIFICATIONS_KEY}_${userId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  }

  getUnreadCount(userId: string): number {
    return this.getUserNotifications(userId).filter((n) => !n.read).length
  }

  markAsRead(userId: string, notificationId: string): void {
    const notifications = this.getUserNotifications(userId)
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveUserNotifications(userId, notifications)
      this.notifyListeners(userId, notifications)
    }
  }

  markAllAsRead(userId: string): void {
    const notifications = this.getUserNotifications(userId)
    notifications.forEach((n) => (n.read = true))
    this.saveUserNotifications(userId, notifications)
    this.notifyListeners(userId, notifications)
  }

  deleteNotification(userId: string, notificationId: string): void {
    const notifications = this.getUserNotifications(userId).filter((n) => n.id !== notificationId)
    this.saveUserNotifications(userId, notifications)
    this.notifyListeners(userId, notifications)
  }

  // Notification Preferences
  getUserPreferences(userId: string): NotificationPreferences {
    if (typeof window === "undefined") {
      return this.getDefaultPreferences(userId)
    }

    const key = `${this.PREFERENCES_KEY}_${userId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : this.getDefaultPreferences(userId)
  }

  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const current = this.getUserPreferences(userId)
    const updated = { ...current, ...preferences }
    const key = `${this.PREFERENCES_KEY}_${userId}`
    localStorage.setItem(key, JSON.stringify(updated))
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      matchReminders: true,
      friendRequests: true,
      tournamentUpdates: true,
      achievements: true,
      socialActivity: false,
      reminderTiming: 60, // 1 hour before
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
      },
    }
  }

  // Smart Notification Creation
  async scheduleMatchReminder(userId: string, match: any): Promise<void> {
    const preferences = this.getUserPreferences(userId)
    if (!preferences.matchReminders) return

    const matchDate = new Date(`${match.date} ${match.time}`)
    const reminderTime = new Date(matchDate.getTime() - preferences.reminderTiming * 60 * 1000)

    await this.createNotification({
      userId,
      type: "match_reminder",
      title: "Match Reminder",
      message: `Your match against ${match.opponent} starts in ${preferences.reminderTiming} minutes at ${match.location}`,
      data: { match },
      priority: "high",
      category: "matches",
      scheduledFor: reminderTime.toISOString(),
      actionUrl: "/matches",
      actionLabel: "View Match",
    })
  }

  async notifyFriendRequest(userId: string, fromUser: any): Promise<void> {
    const preferences = this.getUserPreferences(userId)
    if (!preferences.friendRequests) return

    await this.createNotification({
      userId,
      type: "friend_request",
      title: "New Friend Request",
      message: `${fromUser.name} wants to connect with you on Set Point`,
      data: { fromUser },
      priority: "medium",
      category: "social",
      actionUrl: "/friends",
      actionLabel: "View Request",
    })
  }

  async notifyTournamentUpdate(userId: string, tournament: any, updateType: string): Promise<void> {
    const preferences = this.getUserPreferences(userId)
    if (!preferences.tournamentUpdates) return

    let message = ""
    switch (updateType) {
      case "started":
        message = `Tournament "${tournament.name}" has started!`
        break
      case "next_round":
        message = `Next round is ready in "${tournament.name}"`
        break
      case "winner":
        message = `Tournament "${tournament.name}" has ended`
        break
      default:
        message = `Update in tournament "${tournament.name}"`
    }

    await this.createNotification({
      userId,
      type: "tournament_update",
      title: "Tournament Update",
      message,
      data: { tournament, updateType },
      priority: "medium",
      category: "tournaments",
      actionUrl: "/tournaments",
      actionLabel: "View Tournament",
    })
  }

  async notifyAchievement(userId: string, achievement: any): Promise<void> {
    const preferences = this.getUserPreferences(userId)
    if (!preferences.achievements) return

    await this.createNotification({
      userId,
      type: "achievement",
      title: "Achievement Unlocked!",
      message: `You've unlocked "${achievement.name}" - ${achievement.description}`,
      data: { achievement },
      priority: "high",
      category: "achievements",
      actionUrl: "/social",
      actionLabel: "View Achievement",
    })
  }

  // Push Notifications
  private async initializePushNotifications(): Promise<void> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      this.pushSubscription = subscription
    } catch (error) {
      console.error("Failed to initialize push notifications:", error)
    }
  }

  async requestPushPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  private async maybeShowBrowserNotification(notification: Notification): Promise<void> {
    const preferences = this.getUserPreferences(notification.userId)
    if (!preferences.pushNotifications) return

    // Check quiet hours
    if (this.isQuietHours(preferences)) return

    // Check if browser notifications are supported and permitted
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    // Show browser notification for high priority notifications
    if (notification.priority === "high" || notification.priority === "urgent") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/tennis-ball-realistic.png",
        badge: "/tennis-ball-realistic.png",
        tag: notification.id,
        requireInteraction: notification.priority === "urgent",
        actions: notification.actionLabel
          ? [
              {
                action: "view",
                title: notification.actionLabel,
              },
            ]
          : undefined,
      })
    }
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    const start = preferences.quietHours.start
    const end = preferences.quietHours.end

    if (start <= end) {
      return currentTime >= start && currentTime <= end
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime <= end
    }
  }

  // Notification Scheduler
  private startNotificationScheduler(): void {
    if (typeof window === "undefined") return

    // Check for scheduled notifications every minute
    setInterval(() => {
      this.processScheduledNotifications()
    }, 60000)
  }

  private processScheduledNotifications(): void {
    // In a real app, this would be handled by a backend service
    // For demo purposes, we'll simulate processing scheduled notifications
    const now = new Date()

    // This is a simplified version - in production, you'd have a proper queue
    console.log(`[v0] Processing scheduled notifications at ${now.toISOString()}`)
  }

  // Event Listeners
  addNotificationListener(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const listener = (notifications: Notification[]) => {
      callback(notifications)
    }
    this.notificationListeners.push(listener)

    // Return unsubscribe function
    return () => {
      const index = this.notificationListeners.indexOf(listener)
      if (index > -1) {
        this.notificationListeners.splice(index, 1)
      }
    }
  }

  private notifyListeners(userId: string, notifications: Notification[]): void {
    this.notificationListeners.forEach((listener) => {
      try {
        listener(notifications)
      } catch (error) {
        console.error("Error in notification listener:", error)
      }
    })
  }

  // Utility Methods
  private saveUserNotifications(userId: string, notifications: Notification[]): void {
    if (typeof window === "undefined") return
    const key = `${this.NOTIFICATIONS_KEY}_${userId}`
    localStorage.setItem(key, JSON.stringify(notifications))
  }

  // Bulk Operations
  async createBulkNotifications(notifications: Omit<Notification, "id" | "createdAt" | "read">[]): Promise<void> {
    for (const notification of notifications) {
      await this.createNotification(notification)
    }
  }

  getNotificationsByCategory(userId: string, category: Notification["category"]): Notification[] {
    return this.getUserNotifications(userId).filter((n) => n.category === category)
  }

  getNotificationsByType(userId: string, type: Notification["type"]): Notification[] {
    return this.getUserNotifications(userId).filter((n) => n.type === type)
  }
}
