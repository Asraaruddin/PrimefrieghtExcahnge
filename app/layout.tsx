import type { Metadata } from 'next'
import './globals.css'   // 🔴 REQUIRED

export const metadata: Metadata = {
  title: {
    default: 'Central Freight Express',
    template: '%s | Central Freight Express',
  },
  description:
    'Reliable freight and logistics solutions with nationwide coverage and real-time tracking.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
