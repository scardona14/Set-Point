"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Vibrate, Bell, Share2, Battery } from "lucide-react"

// Capacitor imports (will be available when running in native app)
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean
      getPlatform: () => string
    }
  }
}

export function MobileNativeFeatures() {
  const [isNative, setIsNative] = useState(false)
  const [platform, setPlatform] = useState<string>("")
  const [features, setFeatures] = useState({
    haptics: false,
    notifications: false,
    share: false,
    statusBar: false,
  })

  useEffect(() => {
    // Check if running in native Capacitor app
    if (typeof window !== "undefined" && window.Capacitor) {
      setIsNative(window.Capacitor.isNativePlatform())
      setPlatform(window.Capacitor.getPlatform())

      // Check available features
      setFeatures({
        haptics: true,
        notifications: true,
        share: true,
        statusBar: true,
      })
    }
  }, [])

  const triggerHaptic = async () => {
    if (isNative && window.Capacitor) {
      try {
        // Dynamic import for Capacitor plugins
        const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
        await Haptics.impact({ style: ImpactStyle.Medium })
      } catch (error) {
        console.log("Haptics not available:", error)
      }
    }
  }

  const scheduleNotification = async () => {
    if (isNative && window.Capacitor) {
      try {
        const { LocalNotifications } = await import("@capacitor/local-notifications")

        // Request permission first
        const permission = await LocalNotifications.requestPermissions()

        if (permission.display === "granted") {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: "Set Point Reminder",
                body: "Don't forget your tennis match in 30 minutes!",
                id: Date.now(),
                schedule: { at: new Date(Date.now() + 5000) }, // 5 seconds from now for demo
                sound: "default",
                attachments: undefined,
                actionTypeId: "",
                extra: null,
              },
            ],
          })
        }
      } catch (error) {
        console.log("Notifications not available:", error)
      }
    }
  }

  const shareMatch = async () => {
    if (isNative && window.Capacitor) {
      try {
        const { Share } = await import("@capacitor/share")
        await Share.share({
          title: "Join me for tennis!",
          text: "I just scheduled a tennis match on Set Point. Want to play?",
          url: "https://setpoint.app",
          dialogTitle: "Share Tennis Match",
        })
      } catch (error) {
        console.log("Share not available:", error)
      }
    }
  }

  if (!isNative) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Native Features
          </CardTitle>
          <CardDescription>Install the mobile app to access native device features</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Native features like haptic feedback, push notifications, and native sharing are available when you install
            Set Point as a mobile app.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Native Features
          <Badge variant="secondary">{platform}</Badge>
        </CardTitle>
        <CardDescription>Enhanced mobile experience with native device integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerHaptic}
            disabled={!features.haptics}
            className="flex items-center gap-2 bg-transparent"
          >
            <Vibrate className="h-4 w-4" />
            Haptic
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={scheduleNotification}
            disabled={!features.notifications}
            className="flex items-center gap-2 bg-transparent"
          >
            <Bell className="h-4 w-4" />
            Notify
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={shareMatch}
            disabled={!features.share}
            className="flex items-center gap-2 bg-transparent"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!features.statusBar}
            className="flex items-center gap-2 bg-transparent"
          >
            <Battery className="h-4 w-4" />
            Status
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Native features are active. Enjoy the enhanced mobile experience!
        </p>
      </CardContent>
    </Card>
  )
}
