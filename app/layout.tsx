import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import "./globals.css"

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
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#164e63",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Set Point",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Set Point",
    "application-name": "Set Point",
    "msapplication-TileColor": "#164e63",
    "msapplication-tap-highlight": "no",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable} antialiased`}>
      <head>
        <link rel="icon" href="/tennis-ball-realistic.png" />
        <link rel="apple-touch-icon" href="/tennis-ball-realistic.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#164e63" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Set Point" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Set Point" />
        <meta name="msapplication-TileColor" content="#164e63" />
        <meta name="msapplication-tap-highlight" content="no" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans bg-background text-foreground">{children}</body>
    </html>
  )
}
