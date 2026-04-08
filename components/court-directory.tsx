"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, MapPin, Star, Trash2, Edit, Sun, Moon, Building2, Search } from "lucide-react"

interface Court {
  id: string
  user_id: string
  name: string
  address: string | null
  city: string | null
  sport: string
  surface_type: string | null
  num_courts: number | null
  has_lights: boolean
  is_indoor: boolean
  notes: string | null
  is_favorite: boolean
  created_at: string
}

interface CourtDirectoryProps {
  userId: string
  selectedSport?: string
}

const surfaceTypes = {
  tennis: ["Hard", "Clay", "Grass", "Carpet", "Indoor Hard"],
  pickleball: ["Concrete", "Asphalt", "Indoor Sport Court", "Wood"],
  padel: ["Artificial Turf", "Concrete", "Indoor"]
}

export function CourtDirectory({ userId, selectedSport = "tennis" }: CourtDirectoryProps) {
  const [courts, setCourts] = useState<Court[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSport, setFilterSport] = useState<string>("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    sport: selectedSport,
    surface_type: "",
    num_courts: "",
    has_lights: false,
    is_indoor: false,
    notes: "",
    is_favorite: false
  })

  const supabase = createClient()

  useEffect(() => {
    loadCourts()
  }, [])

  async function loadCourts() {
    setLoading(true)
    const { data, error } = await supabase
      .from("courts")
      .select("*")
      .eq("user_id", userId)
      .order("is_favorite", { ascending: false })
      .order("name")

    if (error) {
      toast.error("Failed to load courts")
    } else {
      setCourts(data || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const courtData = {
      user_id: userId,
      name: formData.name,
      address: formData.address || null,
      city: formData.city || null,
      sport: formData.sport,
      surface_type: formData.surface_type || null,
      num_courts: formData.num_courts ? parseInt(formData.num_courts) : null,
      has_lights: formData.has_lights,
      is_indoor: formData.is_indoor,
      notes: formData.notes || null,
      is_favorite: formData.is_favorite
    }

    if (editingCourt) {
      const { error } = await supabase
        .from("courts")
        .update(courtData)
        .eq("id", editingCourt.id)

      if (error) {
        toast.error("Failed to update court")
      } else {
        toast.success("Court updated!")
        loadCourts()
      }
    } else {
      const { error } = await supabase
        .from("courts")
        .insert(courtData)

      if (error) {
        toast.error("Failed to add court")
      } else {
        toast.success("Court added!")
        loadCourts()
      }
    }

    resetForm()
    setDialogOpen(false)
  }

  async function deleteCourt(id: string) {
    const { error } = await supabase
      .from("courts")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Failed to delete court")
    } else {
      toast.success("Court deleted")
      loadCourts()
    }
  }

  async function toggleFavorite(court: Court) {
    const { error } = await supabase
      .from("courts")
      .update({ is_favorite: !court.is_favorite })
      .eq("id", court.id)

    if (error) {
      toast.error("Failed to update favorite")
    } else {
      loadCourts()
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      address: "",
      city: "",
      sport: selectedSport,
      surface_type: "",
      num_courts: "",
      has_lights: false,
      is_indoor: false,
      notes: "",
      is_favorite: false
    })
    setEditingCourt(null)
  }

  function openEditDialog(court: Court) {
    setEditingCourt(court)
    setFormData({
      name: court.name,
      address: court.address || "",
      city: court.city || "",
      sport: court.sport,
      surface_type: court.surface_type || "",
      num_courts: court.num_courts?.toString() || "",
      has_lights: court.has_lights,
      is_indoor: court.is_indoor,
      notes: court.notes || "",
      is_favorite: court.is_favorite
    })
    setDialogOpen(true)
  }

  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.address?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSport = filterSport === "all" || court.sport === filterSport
    const matchesFavorite = !showFavoritesOnly || court.is_favorite
    return matchesSearch && matchesSport && matchesFavorite
  })

  const getSportColor = (sport: string) => {
    switch (sport) {
      case "tennis": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pickleball": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "padel": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Court Directory</h2>
          <p className="text-muted-foreground">Save your favorite courts and venues</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Court
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourt ? "Edit Court" : "Add New Court"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Court Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Central Park Tennis Courts"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sport">Sport *</Label>
                <Select value={formData.sport} onValueChange={(v) => setFormData({ ...formData, sport: v, surface_type: "" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                    <SelectItem value="padel">Padel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface Type</Label>
                  <Select value={formData.surface_type} onValueChange={(v) => setFormData({ ...formData, surface_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {surfaceTypes[formData.sport as keyof typeof surfaceTypes]?.map(surface => (
                        <SelectItem key={surface} value={surface}>{surface}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num_courts">Number of Courts</Label>
                  <Input
                    id="num_courts"
                    type="number"
                    min="1"
                    value={formData.num_courts}
                    onChange={(e) => setFormData({ ...formData, num_courts: e.target.value })}
                    placeholder="4"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    id="has_lights"
                    checked={formData.has_lights}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_lights: checked })}
                  />
                  <Label htmlFor="has_lights" className="flex items-center gap-1">
                    <Sun className="w-4 h-4" /> Has Lights
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_indoor"
                    checked={formData.is_indoor}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_indoor: checked })}
                  />
                  <Label htmlFor="is_indoor" className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> Indoor
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Reservation required, $10/hour..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_favorite"
                  checked={formData.is_favorite}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_favorite: checked })}
                />
                <Label htmlFor="is_favorite" className="flex items-center gap-1">
                  <Star className="w-4 h-4" /> Mark as Favorite
                </Label>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">
                {editingCourt ? "Update Court" : "Add Court"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSport} onValueChange={setFilterSport}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            <SelectItem value="tennis">Tennis</SelectItem>
            <SelectItem value="pickleball">Pickleball</SelectItem>
            <SelectItem value="padel">Padel</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="gap-2"
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
          Favorites
        </Button>
      </div>

      {/* Courts List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading courts...</div>
      ) : filteredCourts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courts yet</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterSport !== "all" || showFavoritesOnly
                ? "No courts match your filters"
                : "Add your favorite courts and venues to quickly schedule matches"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourts.map(court => (
            <Card key={court.id} className="relative group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {court.name}
                      {court.is_favorite && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </CardTitle>
                    {court.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {court.city}
                      </p>
                    )}
                  </div>
                  <Badge className={getSportColor(court.sport)}>
                    {court.sport}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {court.address && (
                  <p className="text-sm text-muted-foreground">{court.address}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {court.surface_type && (
                    <Badge variant="outline" className="text-xs">{court.surface_type}</Badge>
                  )}
                  {court.num_courts && (
                    <Badge variant="outline" className="text-xs">{court.num_courts} courts</Badge>
                  )}
                  {court.has_lights && (
                    <Badge variant="outline" className="text-xs">
                      <Sun className="w-3 h-3 mr-1" /> Lights
                    </Badge>
                  )}
                  {court.is_indoor && (
                    <Badge variant="outline" className="text-xs">
                      <Building2 className="w-3 h-3 mr-1" /> Indoor
                    </Badge>
                  )}
                </div>

                {court.notes && (
                  <p className="text-xs text-muted-foreground italic">{court.notes}</p>
                )}

                <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavorite(court)}
                  >
                    <Star className={`w-4 h-4 ${court.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(court)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteCourt(court.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
