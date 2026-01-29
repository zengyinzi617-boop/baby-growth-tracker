'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import LoginPage from '@/components/LoginPage'
import MainApp from '@/components/MainApp'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const password = sessionStorage.getItem('site_password')
      if (password === process.env.NEXT_PUBLIC_SITE_PASSWORD) {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  return <MainApp />
}
