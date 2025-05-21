import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  VideoIcon, 
  Mic2, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Film,
  LogOut,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

type SidebarProps = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation()
  const { signOut } = useAuth()
  
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to log out')
      console.error(error)
    }
  }
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/create', label: 'Content Creator', icon: <VideoIcon size={20} /> },
    { path: '/voice', label: 'Voice Studio', icon: <Mic2 size={20} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ]
  
  return (
    <aside 
      className={cn(
        'h-screen bg-white border-r border-animaker-gray-300 flex-shrink-0 overflow-y-auto transition-all duration-300 fixed z-20 shadow-sm',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-animaker-gray-300">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-lg font-heading font-semibold animaker-gradient-text">ContentAI</h1>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <Film className="h-8 w-8 text-primary" />
          </div>
        )}
      </div>
      
      <div className="py-4">
        <nav>
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center py-2 px-3 rounded-animaker transition-colors',
                    location.pathname === item.path 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-animaker-text-light hover:bg-animaker-gray-100 hover:text-primary',
                    collapsed ? 'justify-center' : ''
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="absolute bottom-16 left-0 right-0 px-2">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center py-2 px-3 text-animaker-text-light hover:bg-animaker-gray-100 hover:text-destructive rounded-animaker transition-colors',
            collapsed ? 'justify-center' : ''
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="ml-3">Logout</span>}
        </button>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-animaker-text-light hover:bg-animaker-gray-100 hover:text-primary rounded-animaker transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}