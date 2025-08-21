"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"

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

interface AppUser {
  id: string
  name: string
  email: string
  avatar?: string
  skillLevel?: string
  bio?: string
  location?: string
  joinDate?: string
}

interface Friend {
  id: string
  name: string
  email: string
  skillLevel: string
  addedDate: string
  matchesPlayed: number
  lastPlayed?: string
}

interface FriendRequest {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserEmail: string
  toEmail: string
  message: string
  status: "pending" | "accepted" | "declined"
  sentDate: string
}

const USERS_STORAGE_KEY = "setpoint_users"
const CURRENT_USER_KEY = "setpoint_current_user"

const getUserData = (userId: string) => {
  if (typeof window === "undefined") return null
  const key = `setpoint_user_${userId}`
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null
}

const saveUserData = (userId: string, data: any) => {
  if (typeof window === "undefined") return
  const key = `setpoint_user_${userId}`
  localStorage.setItem(key, JSON.stringify(data))
}

const getAllUsers = (): any[] => {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem(USERS_STORAGE_KEY)
  return users ? JSON.parse(users) : []
}

const saveUser = (user: any) => {
  if (typeof window === "undefined") return
  const users = getAllUsers()
  const existingIndex = users.findIndex((u) => u.id === user.id)
  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

const findUserByEmail = (email: string): any | null => {
  const users = getAllUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export default function TennisMatchOrganizer() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [authError, setAuthError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState<"dashboard" | "matches" | "friends" | "profile">("dashboard")
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [matchForm, setMatchForm] = useState({
    opponent: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  })

  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendForm, setFriendForm] = useState({ email: "", message: "" })
  const [friendsView, setFriendsView] = useState<"list" | "requests" | "add">("list")

  useEffect(() => {
    if (typeof window === "undefined") return

    const savedUserId = localStorage.getItem(CURRENT_USER_KEY)
    if (savedUserId) {
      const users = getAllUsers()
      const user = users.find((u) => u.id === savedUserId)
      if (user) {
        setCurrentUser(user)
        const userData = getUserData(savedUserId)
        if (userData?.matches) {
          setMatches(userData.matches)
        }
        if (userData?.friends) {
          setFriends(userData.friends)
        }
        if (userData?.friendRequests) {
          setFriendRequests(userData.friendRequests)
        }
      }
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError("")

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      if (isSignUp) {
        if (!name || !email || !password) {
          setAuthError("All fields are required")
          return
        }

        if (password.length < 6) {
          setAuthError("Password must be at least 6 characters")
          return
        }

        const existingUser = findUserByEmail(email)
        if (existingUser) {
          setAuthError("An account with this email already exists")
          return
        }

        const newUser: AppUser = {
          id: Date.now().toString(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          skillLevel: "intermediate",
          joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        }

        saveUser(newUser)
        localStorage.setItem(CURRENT_USER_KEY, newUser.id)
        saveUserData(newUser.id, { matches: [], friends: [], friendRequests: [] })
        setCurrentUser(newUser)
        setMatches([])
        setFriends([])
        setFriendRequests([])
      } else {
        if (!email || !password) {
          setAuthError("Email and password are required")
          return
        }

        const user = findUserByEmail(email)
        if (!user) {
          setAuthError("No account found with this email")
          return
        }

        localStorage.setItem(CURRENT_USER_KEY, user.id)
        setCurrentUser(user)

        const userData = getUserData(user.id)
        if (userData?.matches) {
          setMatches(userData.matches)
        }
        if (userData?.friends) {
          setFriends(userData.friends)
        }
        if (userData?.friendRequests) {
          setFriendRequests(userData.friendRequests)
        }
      }
    } catch (error) {
      setAuthError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(CURRENT_USER_KEY)
    setCurrentUser(null)
    setMatches([])
    setFriends([])
    setFriendRequests([])
    setAuthError("")
  }

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!matchForm.opponent || !matchForm.date || !matchForm.time || !matchForm.location) {
      return
    }

    const newMatch: Match = {
      id: Date.now().toString(),
      opponent: matchForm.opponent,
      date: matchForm.date,
      time: matchForm.time,
      location: matchForm.location,
      notes: matchForm.notes,
      status: "upcoming" as const,
    }

    const updatedMatches = [...matches, newMatch]
    setMatches(updatedMatches)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      saveUserData(currentUser.id, { ...userData, matches: updatedMatches })
    }

    setShowCreateMatch(false)
    setMatchForm({ opponent: "", date: "", time: "", location: "", notes: "" })
  }

  const handleSendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendForm.email || !currentUser) return

    const targetUser = findUserByEmail(friendForm.email)
    if (!targetUser) {
      alert("No user found with this email address. They need to create an account first!")
      return
    }

    if (targetUser.id === currentUser.id) {
      alert("You cannot send a friend request to yourself!")
      return
    }

    if (friends.some((f) => f.email === friendForm.email)) {
      alert("You are already friends with this user!")
      return
    }

    if (friendRequests.some((r) => r.toEmail === friendForm.email && r.status === "pending")) {
      alert("Friend request already sent to this user!")
      return
    }

    const newRequest: FriendRequest = {
      id: Date.now().toString(),
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserEmail: currentUser.email,
      toEmail: friendForm.email,
      message:
        friendForm.message || `Hi! I'd like to connect with you on Set Point to organize tennis matches together.`,
      status: "pending",
      sentDate: new Date().toLocaleDateString(),
    }

    const updatedRequests = [...friendRequests, newRequest]
    setFriendRequests(updatedRequests)

    const targetUserData = getUserData(targetUser.id) || {}
    const targetRequests = targetUserData.friendRequests || []
    targetRequests.push(newRequest)
    saveUserData(targetUser.id, { ...targetUserData, friendRequests: targetRequests })

    const userData = getUserData(currentUser.id) || {}
    saveUserData(currentUser.id, { ...userData, friendRequests: updatedRequests })

    setFriendForm({ email: "", message: "" })
    setShowAddFriend(false)
    alert("Friend request sent successfully!")
  }

  const handleAcceptFriendRequest = (request: FriendRequest) => {
    if (!currentUser) return

    const newFriend: Friend = {
      id: request.fromUserId,
      name: request.fromUserName,
      email: request.fromUserEmail,
      skillLevel: "intermediate",
      addedDate: new Date().toLocaleDateString(),
      matchesPlayed: 0,
    }

    const updatedFriends = [...friends, newFriend]
    setFriends(updatedFriends)

    const senderData = getUserData(request.fromUserId) || {}
    const senderFriends = senderData.friends || []
    senderFriends.push({
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      skillLevel: currentUser.skillLevel || "intermediate",
      addedDate: new Date().toLocaleDateString(),
      matchesPlayed: 0,
    })
    saveUserData(request.fromUserId, { ...senderData, friends: senderFriends })

    const updatedRequests = friendRequests.map((r) => (r.id === request.id ? { ...r, status: "accepted" as const } : r))
    setFriendRequests(updatedRequests)

    const userData = getUserData(currentUser.id) || {}
    saveUserData(currentUser.id, {
      ...userData,
      friends: updatedFriends,
      friendRequests: updatedRequests,
    })

    alert("Friend request accepted!")
  }

  const handleDeclineFriendRequest = (request: FriendRequest) => {
    const updatedRequests = friendRequests.map((r) => (r.id === request.id ? { ...r, status: "declined" as const } : r))
    setFriendRequests(updatedRequests)

    if (currentUser) {
      const userData = getUserData(currentUser.id) || {}
      saveUserData(currentUser.id, { ...userData, friendRequests: updatedRequests })
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <Image
              src="/tennis-ball-realistic.png"
              alt="Set Point Logo"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-cyan-900">Set Point</h1>
            <p className="text-gray-600">Your ultimate tennis organizer</p>
          </div>

          <div className="flex mb-4">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 text-center rounded-l-lg ${!isSignUp ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 text-center rounded-r-lg ${isSignUp ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
                minLength={6}
              />
            </div>
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{authError}</div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 disabled:opacity-50"
            >
              {isLoading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
      <header className="bg-white border-b border-cyan-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/tennis-ball-realistic.png" alt="Set Point Logo" width={40} height={40} />
            <h1 className="text-xl font-bold text-cyan-900">Set Point</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
              <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="flex mb-6 bg-white rounded-lg p-1">
          {[
            { key: "dashboard", label: "📊 Dashboard" },
            { key: "matches", label: "🎾 Matches" },
            { key: "friends", label: "👥 Friends" },
            { key: "profile", label: "👤 Profile" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as any)}
              className={`flex-1 py-2 px-4 text-center rounded-md ${
                activeView === tab.key ? "bg-cyan-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeView === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Matches</h3>
                  <span className="text-2xl">🎾</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
                <p className="text-xs text-gray-500">All time matches</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Win Rate</h3>
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {matches.length > 0
                    ? Math.round(
                        (matches.filter((m) => m.status === "completed" && m.score?.includes("Won")).length /
                          matches.filter((m) => m.status === "completed").length) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-gray-500">Match win percentage</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">This Month</h3>
                  <span className="text-2xl">📅</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {matches.filter((m) => new Date(m.date).getMonth() === new Date().getMonth()).length}
                </div>
                <p className="text-xs text-gray-500">Matches played</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCreateMatch(true)}
                    className="w-full bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700"
                  >
                    ➕ Schedule New Match
                  </button>
                  <button
                    onClick={() => setActiveView("friends")}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                  >
                    👥 Manage Friends
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Matches</h3>
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No matches yet!</p>
                    <button
                      onClick={() => setShowCreateMatch(true)}
                      className="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700"
                    >
                      Schedule Your First Match
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.slice(0, 3).map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">vs {match.opponent}</p>
                          <p className="text-sm text-gray-500">
                            {match.date} at {match.time}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            match.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {match.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === "matches" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">My Matches</h2>
              <button
                onClick={() => setShowCreateMatch(true)}
                className="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700"
              >
                ➕ New Match
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No matches scheduled yet</p>
                <button
                  onClick={() => setShowCreateMatch(true)}
                  className="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700"
                >
                  Schedule Your First Match
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-lg">vs {match.opponent}</h3>
                        <p className="text-gray-600">
                          {match.date} at {match.time}
                        </p>
                        <p className="text-gray-500">{match.location}</p>
                        {match.notes && <p className="text-sm text-gray-500 mt-1">{match.notes}</p>}
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            match.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : match.status === "in-progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {match.status}
                        </span>
                        {match.score && <p className="text-sm text-gray-600 mt-1">{match.score}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === "friends" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Tennis Friends</h2>
              <button
                onClick={() => setShowAddFriend(true)}
                className="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700"
              >
                ➕ Add Friend
              </button>
            </div>

            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFriendsView("list")}
                className={`flex-1 py-2 px-4 text-center rounded-md ${
                  friendsView === "list" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setFriendsView("requests")}
                className={`flex-1 py-2 px-4 text-center rounded-md ${
                  friendsView === "requests" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
              >
                Requests ({friendRequests.filter((r) => r.status === "pending").length})
              </button>
            </div>

            {friendsView === "list" && (
              <div>
                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No friends added yet</p>
                    <button
                      onClick={() => setShowAddFriend(true)}
                      className="bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700"
                    >
                      Add Your First Friend
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-medium">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-medium">{friend.name}</h3>
                              <p className="text-sm text-gray-600">{friend.email}</p>
                              <p className="text-xs text-gray-500">
                                Skill: {friend.skillLevel} • Added {friend.addedDate}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => {
                                setMatchForm((prev) => ({ ...prev, opponent: friend.name }))
                                setShowCreateMatch(true)
                              }}
                              className="bg-cyan-600 text-white py-1 px-3 rounded text-sm hover:bg-cyan-700"
                            >
                              Challenge
                            </button>
                            <p className="text-xs text-gray-500 mt-1">{friend.matchesPlayed} matches played</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {friendsView === "requests" && (
              <div>
                {friendRequests.filter((r) => r.status === "pending").length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No pending friend requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friendRequests
                      .filter((r) => r.status === "pending")
                      .map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{request.fromUserName}</h3>
                              <p className="text-sm text-gray-600">{request.fromUserEmail}</p>
                              <p className="text-sm text-gray-700 mt-2">{request.message}</p>
                              <p className="text-xs text-gray-500 mt-1">Sent {request.sentDate}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAcceptFriendRequest(request)}
                                className="bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleDeclineFriendRequest(request)}
                                className="bg-gray-600 text-white py-1 px-3 rounded text-sm hover:bg-gray-700"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === "profile" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">My Profile</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{currentUser.name}</h3>
                  <p className="text-sm text-gray-600">{currentUser.email}</p>
                  <p className="text-sm text-gray-500">Joined {currentUser.joinDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <h4 className="font-medium mb-2">Tennis Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Matches:</span>
                      <span>{matches.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span>{matches.filter((m) => m.status === "completed").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Upcoming:</span>
                      <span>{matches.filter((m) => m.status === "upcoming").length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Skill Level</h4>
                  <p className="text-sm text-gray-600 capitalize">{currentUser.skillLevel || "Intermediate"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Tennis Friend</h3>
            <form onSubmit={handleSendFriendRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Friend's Email</label>
                <input
                  type="email"
                  placeholder="Enter their email address"
                  value={friendForm.email}
                  onChange={(e) => setFriendForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Message (Optional)</label>
                <textarea
                  placeholder="Hi! I'd like to connect with you on Set Point..."
                  value={friendForm.message}
                  onChange={(e) => setFriendForm((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddFriend(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule New Match</h3>
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opponent</label>
                <input
                  type="text"
                  placeholder="Enter opponent's name"
                  value={matchForm.opponent}
                  onChange={(e) => setMatchForm((prev) => ({ ...prev, opponent: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={matchForm.date}
                    onChange={(e) => setMatchForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={matchForm.time}
                    onChange={(e) => setMatchForm((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Tennis court location"
                  value={matchForm.location}
                  onChange={(e) => setMatchForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  placeholder="Any additional notes..."
                  value={matchForm.notes}
                  onChange={(e) => setMatchForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateMatch(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700">
                  Schedule Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
