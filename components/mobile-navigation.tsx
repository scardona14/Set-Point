"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Calendar, Users, Trophy, Plus, Settings } from "lucide-react"

interface MobileNavigationProps {
  onNavigate: (section: string) => void
  currentSection: string
}

export function MobileNavigation({ onNavigate, currentSection }: MobileNavigationProps) {
  const [open, setOpen] = useState(false)

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "matches", label: "Matches", icon: Calendar },
    { id: "friends", label: "Friends", icon: Users },
    { id: "history", label: "History", icon: Trophy },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleNavigate = (section: string) => {
    onNavigate(section)
    setOpen(false)
  }

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col gap-4 mt-8">
            <div className="px-2 mb-4">
              <h2 className="font-serif text-lg font-semibold">Navigation</h2>
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentSection === item.id ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => handleNavigate(item.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
            <div className="border-t pt-4 mt-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => handleNavigate("create-match")}
              >
                <Plus className="h-4 w-4 mr-3" />
                New Match
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
