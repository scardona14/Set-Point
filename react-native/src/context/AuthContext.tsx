"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface User {
  id: string
  name: string
  email: string
  skillLevel: string
  bio: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("setpoint_user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      const users = await AsyncStorage.getItem("setpoint_users")
      const userList = users ? JSON.parse(users) : []

      const foundUser = userList.find((u: any) => u.email === email && u.password === password)

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        await AsyncStorage.setItem("setpoint_user", JSON.stringify(userWithoutPassword))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const users = await AsyncStorage.getItem("setpoint_users")
      const userList = users ? JSON.parse(users) : []

      // Check if user already exists
      if (userList.find((u: any) => u.email === email)) {
        return false
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        skillLevel: "Beginner",
        bio: "",
      }

      userList.push(newUser)
      await AsyncStorage.setItem("setpoint_users", JSON.stringify(userList))

      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      await AsyncStorage.setItem("setpoint_user", JSON.stringify(userWithoutPassword))

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("setpoint_user")
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)

    try {
      await AsyncStorage.setItem("setpoint_user", JSON.stringify(updatedUser))
    } catch (error) {
      console.error("Profile update error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
  )
}
