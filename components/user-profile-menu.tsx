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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, Trophy, Target, Calendar } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  skillLevel?: string
  bio?: string
  location?: string
  joinDate?: string
}

interface UserProfileMenuProps {
  user: UserProfile
  onLogout: () => void
  onUpdateProfile: (user: UserProfile) => void
}

export function UserProfileMenu({ user, onLogout, onUpdateProfile }: UserProfileMenuProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState(user)

  const handleSaveProfile = () => {
    onUpdateProfile(profileData)
    setEditingProfile(false)
    setShowProfile(false)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-indigo-600 text-white">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfile(true)}>
            <Avatar className="mr-2 h-4 w-4">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-indigo-600 text-white">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Match History</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Target className="mr-2 h-4 w-4" />
            <span>Statistics</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              {editingProfile ? "Update your profile information" : "View and manage your profile"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}`} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-indigo-600 text-white text-lg">
                  {getUserInitials(profileData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{profileData.name}</h3>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  Joined {profileData.joinDate || "January 2024"}
                </p>
              </div>
            </div>

            {editingProfile ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Skill Level</Label>
                  <Select
                    value={profileData.skillLevel || "intermediate"}
                    onValueChange={(value) => setProfileData({ ...profileData, skillLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location || ""}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio || ""}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about your tennis journey..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingProfile(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Skill Level</Label>
                    <p className="text-sm font-medium capitalize">{profileData.skillLevel || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Location</Label>
                    <p className="text-sm font-medium">{profileData.location || "Not set"}</p>
                  </div>
                </div>
                {profileData.bio && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Bio</Label>
                    <p className="text-sm mt-1">{profileData.bio}</p>
                  </div>
                )}
                <Button onClick={() => setEditingProfile(true)} className="w-full">
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
