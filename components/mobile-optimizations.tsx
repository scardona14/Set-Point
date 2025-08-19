"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Wifi, WifiOff, Download, Share2 } from "lucide-react"

interface MobileOptimizationsProps {
  children: React.ReactNode
}

export function MobileOptimizations({ children }: MobileOptimizationsProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    // Network status monitoring
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)

      // Show install banner after 5 seconds if not dismissed
      setTimeout(() => {
        const dismissed = localStorage.getItem("install-banner-dismissed")
        if (!dismissed) {
          setShowInstallBanner(true)
        }
      }, 5000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    if (isStandalone) {
      setShowInstallBanner(false)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallBanner(false)
    }
    setInstallPrompt(null)
  }

  const dismissInstallBanner = () => {
    setShowInstallBanner(false)
    localStorage.setItem("install-banner-dismissed", "true")
  }

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Set Point - Tennis Match Organizer",
          text: "Check out this awesome tennis match organizer app!",
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback for browsers without Web Share API
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        // You could show a toast notification here
      }
    }
  }

  return (
    <div className="relative">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            You're offline. Some features may be limited.
          </div>
        </div>
      )}

      {/* Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Card className="border-primary/20 bg-background/95 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Install Set Point</CardTitle>
                    <CardDescription className="text-xs">
                      Add to your home screen for the best experience
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={dismissInstallBanner} className="h-6 w-6 p-0">
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
                <Button variant="outline" onClick={shareApp} size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className={!isOnline ? "pt-12" : ""}>{children}</div>

      {/* Mobile-specific features indicator */}
      <div className="fixed bottom-4 right-4 md:hidden">
        <div className="flex flex-col gap-2">
          {/* Online/Offline indicator */}
          <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
            <div className="flex items-center gap-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </div>
          </Badge>
        </div>
      </div>
    </div>
  )
}
