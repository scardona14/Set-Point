import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans, Barlow_Condensed } from "next/font/google"
import "./globals.css"

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-barlow-condensed",
})

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "Set Point",
  description: "Your ultimate tennis organizer - organize matches with friends, track scores, and send reminders",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable} ${barlowCondensed.variable} antialiased dark`}>
      <body className="font-sans bg-background text-foreground">{children}</body>
    </html>
  )
}
