import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  
  return (
    <div className="flex h-screen bg-animaker-gray-100 relative overflow-hidden">
      {/* Background blobs for aesthetic */}
      <div className="animaker-blob animaker-blob-1"></div>
      <div className="animaker-blob animaker-blob-2"></div>
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-40 h-40 animaker-dot-pattern rounded-full opacity-20 -z-10"></div>
      <div className="absolute bottom-10 left-40 w-60 h-60 animaker-dot-pattern rounded-full opacity-20 -z-10"></div>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent -z-10"></div>
      {/* Animated corner accent */}
      <div className="absolute top-0 right-0 w-64 h-64 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/5 rounded-full animate-float" style={{ animationDuration: '15s' }}></div>
      </div>
      <div className="absolute bottom-0 left-0 w-64 h-64 -z-10 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-secondary/5 rounded-full animate-float" style={{ animationDuration: '20s', animationDelay: '-5s' }}></div>
      </div>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className={`flex-1 overflow-auto transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header with Login/Sign Up button */}
        <div className="flex items-center justify-end h-16 px-6 bg-transparent relative z-20">
          {!user && (
            <Button
              className="animaker-button"
              onClick={() => navigate('/auth')}
            >
              Login / Sign Up
            </Button>
          )}
        </div>
        <div className="container mx-auto py-6 px-6 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}