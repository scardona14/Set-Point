import type React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat, Poppins, Orbitron } from "next/font/google"
import "./globals.css"

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
  title: "Set Point",
  description:
    "Your ultimate racket sports organizer - tennis, pickleball, and padel. Organize matches, run tournaments, track scores, and play with friends.",
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#1A1F2E",
  width: "device-width",
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} ${orbitron.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">{children}</body>
    </html>
  )
}
