import type React from "react"
import type { Metadata, Viewport } from "next"
<<<<<<< HEAD
import { Montserrat, Poppins, Orbitron } from "next/font/google"
import { Toaster } from "sonner"
=======
import { Montserrat, Poppins, Orbitron, Inter } from "next/font/google"
>>>>>>> 1e8b8b9 (Editing the app - guerrilla)
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
})

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Set Point",
  description: "Your ultimate tennis organizer - organize matches with friends, track scores, and send reminders",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Set Point",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ccff00",
=======
  title: "Set Point | San Juan Racquet Sports",
  description: "Find pickup matches, book courts, and manage your racquet sports in San Juan, PR. / Encuentra partidos, reserva canchas y gestiona tus deportes de raqueta en San Juan, PR.",
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Set Point',
  },
  icons: {
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
>>>>>>> 1e8b8b9 (Editing the app - guerrilla)
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} ${orbitron.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
=======
    <html lang="en" className={`dark ${inter.variable} ${montserrat.variable} ${poppins.variable} ${orbitron.variable} antialiased`} style={{ colorScheme: 'dark' }}>
      <body className="font-sans bg-background text-foreground min-h-screen">{children}</body>
>>>>>>> 1e8b8b9 (Editing the app - guerrilla)
    </html>
  )
}
