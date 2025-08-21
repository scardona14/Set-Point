"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Share2,
  Trophy,
  Users,
  Heart,
  MessageCircle,
  Copy,
  Twitter,
  Facebook,
  Instagram,
  Award,
  TrendingUp,
  Star,
  Crown,
  Zap,
  Target,
} from "lucide-react"
import { SocialService, type Achievement, type ActivityFeedItem, type ShareableContent } from "@/lib/social-service"
import { toast } from "@/hooks/use-toast"

interface SocialHubProps {
  currentUser: {
    id: string
    name: string
    email: string
  }
  matches: any[]
  friends: any[]
}

export function SocialHub({ currentUser, matches, friends }: SocialHubProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([])
  const [socialStats, setSocialStats] = useState<any>({})
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareContent, setShareContent] = useState<ShareableContent | null>(null)

  const socialService = SocialService.getInstance()

  useEffect(() => {
    loadSocialData()
  }, [currentUser.id, matches, friends])

  const loadSocialData = () => {
    const updatedAchievements = socialService.updateAchievementProgress(currentUser.id, matches, friends)
    const feed = socialService.getActivityFeed(currentUser.id)
    const stats = socialService.getSocialStats(currentUser.id)
    const leaderboardData = socialService.generateLeaderboard([])

    setAchievements(updatedAchievements)
    setActivityFeed(feed)
    setSocialStats(stats)
    setLeaderboard(leaderboardData)
  }

  const handleShare = (content: ShareableContent) => {
    setShareContent(content)
    setShareDialogOpen(true)
  }

  const handleSocialShare = (platform: "twitter" | "facebook" | "instagram" | "copy") => {
    if (!shareContent) return

    const shareUrl = socialService.shareToSocialMedia(shareContent, platform)

    if (platform === "copy") {
      toast({
        title: "Copied to clipboard!",
        description: "Share text has been copied to your clipboard.",
      })
    } else {
      window.open(shareUrl, "_blank", "width=600,height=400")
    }

    setShareDialogOpen(false)
  }

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      case "rare":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "epic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
      case "legendary":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: ActivityFeedItem["type"]) => {
    switch (type) {
      case "match_won":
        return <Trophy className="h-4 w-4 text-green-600" />
      case "match_lost":
        return <Target className="h-4 w-4 text-orange-600" />
      case "achievement_unlocked":
        return <Award className="h-4 w-4 text-purple-600" />
      case "tournament_joined":
        return <Users className="h-4 w-4 text-blue-600" />
      case "friend_added":
        return <Users className="h-4 w-4 text-cyan-600" />
      case "streak_started":
        return <Zap className="h-4 w-4 text-yellow-600" />
      default:
        return <Star className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Hub</h2>
          <p className="text-muted-foreground">Share achievements and connect with the tennis community</p>
        </div>
        <Button
          onClick={() =>
            handleShare(
              socialService.generateShareableContent("milestone", {
                description: `Join me on Set Point - I've played ${matches.length} matches and unlocked ${socialStats.achievementsUnlocked} achievements!`,
              }),
            )
          }
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Progress
        </Button>
      </div>

      {/* Social Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{socialStats.achievementsUnlocked || 0}</p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{socialStats.totalLikes || 0}</p>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{socialStats.totalComments || 0}</p>
                <p className="text-sm text-muted-foreground">Comments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">#{socialStats.socialRank || 1}</p>
                <p className="text-sm text-muted-foreground">Social Rank</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`hover:shadow-md transition-shadow ${
                  achievement.unlockedAt ? "ring-2 ring-green-200 dark:ring-green-800" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                        <CardDescription className="text-sm">{achievement.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {achievement.progress}/{achievement.requirement}
                      </span>
                    </div>
                    <Progress value={(achievement.progress / achievement.requirement) * 100} className="h-2" />
                  </div>

                  {achievement.unlockedAt ? (
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="gap-1">
                        <Trophy className="h-3 w-3" />
                        Unlocked
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(socialService.generateShareableContent("achievement", achievement))}
                      >
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {achievement.requirement - achievement.progress} more to unlock
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {activityFeed.length > 0 ? (
            <div className="space-y-4">
              {activityFeed.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{activity.userName}</p>
                          <span className="text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{activity.content}</p>
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="gap-1 h-8">
                            <Heart className="h-3 w-3" />
                            {activity.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1 h-8">
                            <MessageCircle className="h-3 w-3" />
                            {activity.comments.length}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1 h-8">
                            <Share2 className="h-3 w-3" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground">Play matches and unlock achievements to see your activity!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>Top players in the Set Point community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((player, index) => (
                  <div key={player.rank} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {player.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {player.winRate}% win rate • {player.matches} matches • {player.achievements} achievements
                      </p>
                    </div>
                    {player.rank <= 3 && (
                      <div className="text-2xl">{player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Achievement
            </DialogTitle>
          </DialogHeader>

          {shareContent && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-1">{shareContent.title}</h4>
                <p className="text-sm text-muted-foreground">{shareContent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => handleSocialShare("twitter")} className="gap-2" variant="outline">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button onClick={() => handleSocialShare("facebook")} className="gap-2" variant="outline">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button onClick={() => handleSocialShare("copy")} className="gap-2" variant="outline">
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button onClick={() => handleSocialShare("instagram")} className="gap-2" variant="outline">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
