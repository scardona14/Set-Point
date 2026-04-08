"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, Trophy, Target, User } from "lucide-react"
import { ProfileSettings } from "@/components/profile-settings"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  skillLevel?: string
  bio?: string
  location?: string
  joinDate?: string
}

interface UserProfileMenuProps {
  user: UserProfile
  onLogout: () => void
  onUpdateProfile: (updates: { name?: string; avatar_url?: string }) => void
  onNavigate?: (tab: string) => void
}

export function UserProfileMenu({ user, onLogout, onUpdateProfile, onNavigate }: UserProfileMenuProps) {
  const [showProfileSettings, setShowProfileSettings] = useState(false)

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarSrc = () => {
    if (!user.avatar_url) return undefined
    return `/api/avatar?pathname=${encodeURIComponent(user.avatar_url)}`
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/30">
              <AvatarImage src={getAvatarSrc()} alt={user.name} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={() => setShowProfileSettings(true)} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigate?.("history")} className="cursor-pointer">
            <Trophy className="mr-2 h-4 w-4" />
            <span>Match History</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onNavigate?.("analytics")} className="cursor-pointer">
            <Target className="mr-2 h-4 w-4" />
            <span>Statistics</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem onClick={onLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileSettings
        open={showProfileSettings}
        onOpenChange={setShowProfileSettings}
        currentUser={user}
        onProfileUpdate={onUpdateProfile}
      />
    </>
  )
}
