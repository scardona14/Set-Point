"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  CalendarDays, 
  Users, 
  Trophy, 
  BarChart3, 
  Zap, 
  Shield,
  ChevronRight,
  Star,
  Play
} from "lucide-react"

const features = [
  {
    icon: CalendarDays,
    title: "Schedule Matches",
    description: "Easily organize matches with friends, set dates, times, and locations all in one place."
  },
  {
    icon: Trophy,
    title: "Track Scores",
    description: "Real-time score tracking with support for tennis, pickleball, and padel scoring rules."
  },
  {
    icon: BarChart3,
    title: "View Statistics",
    description: "Analyze your performance with detailed stats, win rates, and match history."
  },
  {
    icon: Users,
    title: "Connect with Friends",
    description: "Build your network of players, send friend requests, and see who's available to play."
  },
  {
    icon: Zap,
    title: "Tournament Mode",
    description: "Create and manage tournaments with automatic bracket generation."
  },
  {
    icon: Shield,
    title: "Leaderboards",
    description: "Compete with friends and climb the rankings based on your match results."
  }
]

const testimonials = [
  {
    name: "Carlos M.",
    role: "Tennis Player",
    content: "Set Point has completely changed how I organize my weekly tennis matches. No more group text chaos!",
    rating: 5
  },
  {
    name: "Sarah K.",
    role: "Pickleball Enthusiast",
    content: "The score tracking feature is amazing. I can finally see my improvement over time.",
    rating: 5
  },
  {
    name: "Mike R.",
    role: "Padel Club Member",
    content: "Our club uses Set Point for all our tournaments. It's so easy to manage brackets and results.",
    rating: 5
  }
]

const stats = [
  { value: "10K+", label: "Active Players" },
  { value: "50K+", label: "Matches Tracked" },
  { value: "500+", label: "Tournaments" },
  { value: "4.9", label: "App Rating" }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image 
                src="/tennis-ball-logo.png" 
                alt="Set Point" 
                width={32} 
                height={32}
                className="rounded-full"
              />
              <span className="font-bold text-xl text-foreground">Set Point</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
              <Link href="#sports" className="text-muted-foreground hover:text-foreground transition-colors">
                Sports
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-foreground">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign up free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                Now supporting Tennis, Pickleball & Padel
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Your Ultimate
                <span className="text-primary"> Match </span>
                Organizer
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Schedule matches with friends, track scores in real-time, and analyze your performance. 
                The all-in-one app for tennis, pickleball, and padel players.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                    Get Started Free
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative bg-card rounded-2xl p-6 shadow-2xl border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Upcoming Match</div>
                    <div className="text-sm text-muted-foreground">Today at 6:00 PM</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                        JD
                      </div>
                      <div>
                        <div className="font-medium text-foreground">John D.</div>
                        <div className="text-sm text-muted-foreground">Skill: 4.0</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">VS</div>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-foreground text-right">Sarah K.</div>
                        <div className="text-sm text-muted-foreground text-right">Skill: 4.5</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        SK
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>Central Park Tennis Courts</span>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Play
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From scheduling to stats, Set Point has all the tools to elevate your game.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section id="sports" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Three Sports, One App
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you play tennis, pickleball, or padel - we have you covered.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Tennis", emoji: "🎾", color: "bg-green-500/10 text-green-400", description: "Traditional scoring with sets, games, and tiebreaks" },
              { name: "Pickleball", emoji: "🏓", color: "bg-blue-500/10 text-blue-400", description: "Rally scoring to 11, 15, or 21 points" },
              { name: "Padel", emoji: "🎾", color: "bg-orange-500/10 text-orange-400", description: "Doubles format with tennis-style scoring" }
            ].map((sport) => (
              <Card key={sport.name} className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-colors">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 rounded-full ${sport.color} flex items-center justify-center mx-auto mb-6 text-4xl`}>
                    {sport.emoji}
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{sport.name}</h3>
                  <p className="text-muted-foreground">{sport.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Loved by Players
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our community has to say about Set Point.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Elevate Your Game?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of players who use Set Point to organize matches, track progress, and connect with friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                Create Free Account
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image 
                  src="/tennis-ball-logo.png" 
                  alt="Set Point" 
                  width={32} 
                  height={32}
                  className="rounded-full"
                />
                <span className="font-bold text-xl text-foreground">Set Point</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The ultimate match organizer for tennis, pickleball, and padel players.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#sports" className="hover:text-foreground transition-colors">Sports</Link></li>
                <li><Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@setpoint.app" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Set Point. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
