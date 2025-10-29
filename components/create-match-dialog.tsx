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
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  matchFormat?: "singles" | "doubles"
  doublesPartner?: string
}

interface CreateMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateMatch: (match: Omit<Match, "id" | "status">) => void
}

const locations = [
  "Centro de Tennis Honda",
  "Riviera Tennis Courts",
  "Club Deportivo del Oeste",
  "Tennis Club de Puerto Rico",
  "Palmas Athletic Club",
  "Club Náutico de San Juan",
  "Dorado Beach Tennis Club",
  "El San Juan Tennis Club",
  "Caribe Hilton Tennis Courts",
  "Universidad del Sagrado Corazón Tennis Courts",
]

export function CreateMatchDialog({ open, onOpenChange, onCreateMatch }: CreateMatchDialogProps) {
  const [formData, setFormData] = useState({
    opponent: "",
    date: "",
    time: "",
    location: "",
    notes: "",
    matchFormat: "singles" as "singles" | "doubles",
    doublesPartner: "",
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredLocations, setFilteredLocations] = useState(locations)

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
      matchFormat: formData.matchFormat,
      doublesPartner: formData.matchFormat === "doubles" ? formData.doublesPartner : undefined,
    })

    // Reset form
    setFormData({
      opponent: "",
      date: "",
      time: "",
      location: "",
      notes: "",
      matchFormat: "singles",
      doublesPartner: "",
    })
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "location") {
      const filtered = locations.filter((loc) => loc.toLowerCase().includes(value.toLowerCase()))
      setFilteredLocations(filtered)
      setShowSuggestions(value.length > 0 && filtered.length > 0)
    }
  }

  const handleSelectLocation = (location: string) => {
    setFormData((prev) => ({ ...prev, location }))
    setShowSuggestions(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Schedule New Match</DialogTitle>
          <DialogDescription>
            Create a new tennis match. Enter your opponent's name and match details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opponent" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Opponent Name
              </Label>
              <Input
                id="opponent"
                type="text"
                placeholder="Enter opponent's name"
                value={formData.opponent}
                onChange={(e) => handleInputChange("opponent", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Match Format
              </Label>
              <RadioGroup
                value={formData.matchFormat}
                onValueChange={(value) => handleInputChange("matchFormat", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="singles" id="singles" />
                  <Label htmlFor="singles" className="font-normal cursor-pointer">
                    Singles
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doubles" id="doubles" />
                  <Label htmlFor="doubles" className="font-normal cursor-pointer">
                    Doubles
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Doubles Partner Input */}
            {formData.matchFormat === "doubles" && (
              <div className="space-y-2">
                <Label htmlFor="doublesPartner" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Your Doubles Partner
                </Label>
                <Input
                  id="doublesPartner"
                  type="text"
                  placeholder="Enter your partner's name"
                  value={formData.doublesPartner}
                  onChange={(e) => handleInputChange("doublesPartner", e.target.value)}
                />
              </div>
            )}

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
            <div className="space-y-2 relative">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="Type court name or choose from suggestions"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                onFocus={() => {
                  if (formData.location.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                onBlur={() => {
                  // Delay to allow clicking on suggestions
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
                required
              />
              {/* Location suggestions dropdown */}
              {showSuggestions && filteredLocations.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredLocations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm"
                      onClick={() => handleSelectLocation(location)}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
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
