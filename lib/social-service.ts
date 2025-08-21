// Social Features and Sharing Service
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: "matches" | "streaks" | "tournaments" | "social" | "milestones"
  requirement: number
  unlockedAt?: string
  progress: number
  rarity: "common" | "rare" | "epic" | "legendary"
}

export interface ActivityFeedItem {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  type: "match_won" | "match_lost" | "achievement_unlocked" | "tournament_joined" | "friend_added" | "streak_started"
  content: string
  metadata: any
  timestamp: string
  likes: number
  comments: SocialComment[]
  isLiked: boolean
}

export interface SocialComment {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
}

export interface ShareableContent {
  type: "match_result" | "achievement" | "tournament_win" | "milestone"
  title: string
  description: string
  imageUrl?: string
  data: any
}

export interface SocialStats {
  totalLikes: number
  totalComments: number
  totalShares: number
  friendsCount: number
  achievementsUnlocked: number
  socialRank: number
}

export class SocialService {
  private static instance: SocialService
  private readonly ACHIEVEMENTS_KEY = "setpoint_achievements"
  private readonly ACTIVITY_FEED_KEY = "setpoint_activity_feed"
  private readonly SOCIAL_STATS_KEY = "setpoint_social_stats"

  static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService()
    }
    return SocialService.instance
  }

  // Achievement System
  getAvailableAchievements(): Achievement[] {
    return [
      {
        id: "first_match",
        name: "First Serve",
        description: "Play your first tennis match",
        icon: "🎾",
        category: "matches",
        requirement: 1,
        progress: 0,
        rarity: "common",
      },
      {
        id: "ten_matches",
        name: "Getting Started",
        description: "Play 10 tennis matches",
        icon: "🏃",
        category: "matches",
        requirement: 10,
        progress: 0,
        rarity: "common",
      },
      {
        id: "fifty_matches",
        name: "Tennis Enthusiast",
        description: "Play 50 tennis matches",
        icon: "🔥",
        category: "matches",
        requirement: 50,
        progress: 0,
        rarity: "rare",
      },
      {
        id: "win_streak_5",
        name: "Hot Streak",
        description: "Win 5 matches in a row",
        icon: "⚡",
        category: "streaks",
        requirement: 5,
        progress: 0,
        rarity: "rare",
      },
      {
        id: "win_streak_10",
        name: "Unstoppable",
        description: "Win 10 matches in a row",
        icon: "🚀",
        category: "streaks",
        requirement: 10,
        progress: 0,
        rarity: "epic",
      },
      {
        id: "tournament_winner",
        name: "Champion",
        description: "Win your first tournament",
        icon: "🏆",
        category: "tournaments",
        requirement: 1,
        progress: 0,
        rarity: "epic",
      },
      {
        id: "social_butterfly",
        name: "Social Butterfly",
        description: "Add 10 tennis friends",
        icon: "🦋",
        category: "social",
        requirement: 10,
        progress: 0,
        rarity: "common",
      },
      {
        id: "perfectionist",
        name: "Perfectionist",
        description: "Achieve 90% win rate with 20+ matches",
        icon: "💎",
        category: "milestones",
        requirement: 90,
        progress: 0,
        rarity: "legendary",
      },
    ]
  }

  getUserAchievements(userId: string): Achievement[] {
    if (typeof window === "undefined") return []
    const key = `${this.ACHIEVEMENTS_KEY}_${userId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : this.getAvailableAchievements()
  }

  updateAchievementProgress(userId: string, matches: any[], friends: any[]): Achievement[] {
    const achievements = this.getUserAchievements(userId)
    const completedMatches = matches.filter((m) => m.status === "completed")
    const wins = completedMatches.filter((m) => m.won === true).length
    const winRate = completedMatches.length > 0 ? (wins / completedMatches.length) * 100 : 0

    // Calculate current win streak
    let currentStreak = 0
    const sortedMatches = completedMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    for (const match of sortedMatches) {
      if (match.won) {
        currentStreak++
      } else {
        break
      }
    }

    // Update progress for each achievement
    achievements.forEach((achievement) => {
      switch (achievement.id) {
        case "first_match":
          achievement.progress = Math.min(completedMatches.length, 1)
          break
        case "ten_matches":
          achievement.progress = Math.min(completedMatches.length, 10)
          break
        case "fifty_matches":
          achievement.progress = Math.min(completedMatches.length, 50)
          break
        case "win_streak_5":
          achievement.progress = Math.min(currentStreak, 5)
          break
        case "win_streak_10":
          achievement.progress = Math.min(currentStreak, 10)
          break
        case "social_butterfly":
          achievement.progress = Math.min(friends.length, 10)
          break
        case "perfectionist":
          achievement.progress = completedMatches.length >= 20 ? Math.min(winRate, 90) : 0
          break
      }

      // Check if achievement is newly unlocked
      if (achievement.progress >= achievement.requirement && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date().toISOString()
        this.addActivityFeedItem(userId, {
          type: "achievement_unlocked",
          content: `Unlocked achievement: ${achievement.name}`,
          metadata: { achievement },
        })
      }
    })

    // Save updated achievements
    const key = `${this.ACHIEVEMENTS_KEY}_${userId}`
    localStorage.setItem(key, JSON.stringify(achievements))

    return achievements
  }

  // Activity Feed
  getActivityFeed(userId: string): ActivityFeedItem[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.ACTIVITY_FEED_KEY)
    const allActivities: ActivityFeedItem[] = stored ? JSON.parse(stored) : []

    // Return activities from user and their friends (for now, just user's activities)
    return allActivities
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50) // Last 50 activities
  }

  addActivityFeedItem(
    userId: string,
    activity: {
      type: ActivityFeedItem["type"]
      content: string
      metadata?: any
    },
  ): void {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem(this.ACTIVITY_FEED_KEY)
    const activities: ActivityFeedItem[] = stored ? JSON.parse(stored) : []

    const newActivity: ActivityFeedItem = {
      id: `activity_${Date.now()}`,
      userId,
      userName: "You", // In real app, get from user data
      type: activity.type,
      content: activity.content,
      metadata: activity.metadata || {},
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      isLiked: false,
    }

    activities.unshift(newActivity)
    localStorage.setItem(this.ACTIVITY_FEED_KEY, JSON.stringify(activities.slice(0, 100))) // Keep last 100
  }

  // Social Sharing
  generateShareableContent(type: ShareableContent["type"], data: any): ShareableContent {
    switch (type) {
      case "match_result":
        return {
          type,
          title: `${data.won ? "Victory" : "Great Match"} on Set Point!`,
          description: `Just ${data.won ? "won" : "played"} against ${data.opponent} with score ${data.score || "N/A"}`,
          data,
        }

      case "achievement":
        return {
          type,
          title: `Achievement Unlocked: ${data.name}!`,
          description: data.description,
          data,
        }

      case "tournament_win":
        return {
          type,
          title: `Tournament Champion! 🏆`,
          description: `Just won the ${data.tournamentName} tournament!`,
          data,
        }

      case "milestone":
        return {
          type,
          title: `Milestone Reached!`,
          description: data.description,
          data,
        }

      default:
        return {
          type: "match_result",
          title: "Check out Set Point!",
          description: "The ultimate tennis match organizer",
          data,
        }
    }
  }

  shareToSocialMedia(content: ShareableContent, platform: "twitter" | "facebook" | "instagram" | "copy"): string {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    const shareText = `${content.title}\n\n${content.description}\n\nJoin me on Set Point: ${baseUrl}`

    switch (platform) {
      case "twitter":
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}&quote=${encodeURIComponent(shareText)}`

      case "copy":
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(shareText)
        }
        return shareText

      default:
        return shareText
    }
  }

  // Social Stats
  getSocialStats(userId: string): SocialStats {
    if (typeof window === "undefined") {
      return {
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        friendsCount: 0,
        achievementsUnlocked: 0,
        socialRank: 0,
      }
    }

    const activities = this.getActivityFeed(userId)
    const achievements = this.getUserAchievements(userId)
    const unlockedAchievements = achievements.filter((a) => a.unlockedAt).length

    return {
      totalLikes: activities.reduce((sum, activity) => sum + activity.likes, 0),
      totalComments: activities.reduce((sum, activity) => sum + activity.comments.length, 0),
      totalShares: 0, // Would track in real app
      friendsCount: 0, // Would get from friends data
      achievementsUnlocked: unlockedAchievements,
      socialRank: Math.max(1, Math.floor(unlockedAchievements / 2) + 1),
    }
  }

  // Leaderboard
  generateLeaderboard(users: any[]): any[] {
    // Mock leaderboard - in real app would aggregate from all users
    return [
      { rank: 1, name: "Tennis Pro", winRate: 85, matches: 45, achievements: 12 },
      { rank: 2, name: "Court Master", winRate: 78, matches: 38, achievements: 10 },
      { rank: 3, name: "Ace Player", winRate: 72, matches: 42, achievements: 8 },
      { rank: 4, name: "Net Ninja", winRate: 68, matches: 35, achievements: 7 },
      { rank: 5, name: "Baseline Boss", winRate: 65, matches: 28, achievements: 6 },
    ]
  }
}
