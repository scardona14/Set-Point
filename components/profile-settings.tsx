"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, User, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ProfileSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  onProfileUpdate: (updates: { name?: string; avatar_url?: string }) => void
}

export function ProfileSettings({ open, onOpenChange, currentUser, onProfileUpdate }: ProfileSettingsProps) {
  const [name, setName] = useState(currentUser.name)
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || "")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const { pathname } = await response.json()
      setAvatarUrl(pathname)
      toast.success("Photo uploaded!")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload photo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          avatar_url: avatarUrl || null,
        })
        .eq("id", currentUser.id)

      if (error) throw error

      onProfileUpdate({ name, avatar_url: avatarUrl })
      toast.success("Profile updated!")
      onOpenChange(false)
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const getAvatarSrc = () => {
    if (!avatarUrl) return undefined
    return `/api/avatar?pathname=${encodeURIComponent(avatarUrl)}`
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">Profile Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="h-24 w-24 border-2 border-primary/50">
                <AvatarImage src={getAvatarSrc()} alt={name} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground">Click to upload a profile photo</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Display Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-background border-border"
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label className="text-foreground">Email</Label>
            <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 rounded-md">
              {currentUser.email}
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
