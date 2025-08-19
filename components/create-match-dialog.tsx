"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Clock, MapPin, Users } from "lucide-react"

interface Match {
  id: string
  opponent: string
  date: string
  time: string
  location: string
  status: "upcoming" | "completed" | "in-progress"
  score?: string
  notes?: string
}

interface CreateMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateMatch: (match: Omit<Match, "id" | "status">) => void
}

const friends = ["Sarah Johnson", "Mike Chen", "Alex Rodriguez", "Emma Wilson", "David Kim", "Lisa Thompson"]

const locations = [
  "Central Tennis Club",
  "Riverside Courts",
  "City Sports Complex",
  "Westside Tennis Center",
  "Park Avenue Courts",
  "Downtown Athletic Club",
]

export function CreateMatchDialog({ open, onOpenChange, onCreateMatch }: CreateMatchDialogProps) {
  const [formData, setFormData] = useState({
    opponent: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.opponent || !formData.date || !formData.time || !formData.location) {
      return
    }

    onCreateMatch({
      opponent: formData.opponent,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      notes: formData.notes,
    })

    // Reset form
    setFormData({
      opponent: "",
      date: "",
      time: "",
      location: "",
      notes: "",
    })
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Schedule New Match</DialogTitle>
          <DialogDescription>
            Create a new tennis match with one of your friends. They'll receive a notification about the match.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Opponent Selection */}
            <div className="space-y-2">
              <Label htmlFor="opponent" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Opponent
              </Label>
              <Select value={formData.opponent} onValueChange={(value) => handleInputChange("opponent", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a friend to play with" />
                </SelectTrigger>
                <SelectContent>
                  {friends.map((friend) => (
                    <SelectItem key={friend} value={friend}>
                      {friend}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a tennis court" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional details about the match..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule Match</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
