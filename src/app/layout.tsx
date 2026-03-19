import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitnessCoach Admin',
  description: 'Antrenör başvurularını yönet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
