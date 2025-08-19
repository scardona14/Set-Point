"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StatusBar } from "react-native"
import Icon from "react-native-vector-icons/Lucide"

// Screens
import AuthScreen from "./src/screens/AuthScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import MatchesScreen from "./src/screens/MatchesScreen"
import FriendsScreen from "./src/screens/FriendsScreen"
import ProfileScreen from "./src/screens/ProfileScreen"
import ScoreTrackerScreen from "./src/screens/ScoreTrackerScreen"

// Context
import { AuthProvider, useAuth } from "./src/context/AuthContext"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          switch (route.name) {
            case "Dashboard":
              iconName = "home"
              break
            case "Matches":
              iconName = "calendar"
              break
            case "Friends":
              iconName = "users"
              break
            case "Profile":
              iconName = "user"
              break
            default:
              iconName = "circle"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#164e63",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: "#0f172a",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const AppNavigator = () => {
  const { user } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="ScoreTracker"
            component={ScoreTrackerScreen}
            options={{
              headerShown: true,
              title: "Score Tracker",
              headerStyle: { backgroundColor: "#0f172a" },
              headerTintColor: "#ffffff",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}

export default App
