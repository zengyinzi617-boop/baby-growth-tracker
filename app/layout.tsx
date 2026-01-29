import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Baby Growth Tracker',
  description: '记录宝宝成长的点点滴滴',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        {children}
      </body>
    </html>
  )
}
