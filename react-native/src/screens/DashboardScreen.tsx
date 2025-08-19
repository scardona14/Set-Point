"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Icon from "react-native-vector-icons/Lucide"
import { useAuth } from "../context/AuthContext"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

interface Match {
  id: string
  opponent: string
  date: string
  time: string
  location: string
  status: "upcoming" | "completed"
  score?: string
  winner?: string
}

const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [stats, setStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  })

  useEffect(() => {
    loadMatches()
  }, [user])

  const loadMatches = async () => {
    if (!user) return

    try {
      const matchData = await AsyncStorage.getItem(`setpoint_user_${user.id}`)
      if (matchData) {
        const userData = JSON.parse(matchData)
        const userMatches = userData.matches || []
        setMatches(userMatches)

        // Calculate stats
        const completed = userMatches.filter((m: Match) => m.status === "completed")
        const wins = completed.filter((m: Match) => m.winner === user.name).length
        const losses = completed.length - wins
        const winRate = completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0

        setStats({
          totalMatches: completed.length,
          wins,
          losses,
          winRate,
        })
      }
    } catch (error) {
      console.error("Error loading matches:", error)
    }
  }

  const upcomingMatches = matches.filter((m) => m.status === "upcoming").slice(0, 3)

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalMatches}</Text>
            <Text style={styles.statLabel}>Total Matches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.losses}</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Matches")}>
            <LinearGradient colors={["#164e63", "#0891b2"]} style={styles.actionGradient}>
              <Icon name="plus" size={24} color="#ffffff" />
              <Text style={styles.actionText}>New Match</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Friends")}>
            <LinearGradient colors={["#047857", "#10b981"]} style={styles.actionGradient}>
              <Icon name="user-plus" size={24} color="#ffffff" />
              <Text style={styles.actionText}>Add Friend</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Matches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Matches</Text>
        {upcomingMatches.length > 0 ? (
          upcomingMatches.map((match) => (
            <View key={match.id} style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchOpponent}>vs {match.opponent}</Text>
                <Text style={styles.matchDate}>{match.date}</Text>
              </View>
              <View style={styles.matchDetails}>
                <View style={styles.matchDetail}>
                  <Icon name="clock" size={16} color="#64748b" />
                  <Text style={styles.matchDetailText}>{match.time}</Text>
                </View>
                <View style={styles.matchDetail}>
                  <Icon name="map-pin" size={16} color="#64748b" />
                  <Text style={styles.matchDetailText}>{match.location}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="calendar" size={48} color="#cbd5e1" />
            <Text style={styles.emptyStateText}>No upcoming matches</Text>
            <Text style={styles.emptyStateSubtext}>Schedule your first match to get started!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#164e63",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#164e63",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 50) / 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 8,
  },
  matchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  matchOpponent: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  matchDate: {
    fontSize: 14,
    color: "#64748b",
  },
  matchDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  matchDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchDetailText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
    textAlign: "center",
  },
})

export default DashboardScreen
