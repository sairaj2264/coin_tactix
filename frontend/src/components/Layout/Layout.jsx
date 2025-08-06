import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  BarChart3, 
  TrendingUp, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  Briefcase,
  Target
} from 'lucide-react'
import { logoutUser } from '../../store/slices/authSlice'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const unreadCount = useSelector((state) => state.alerts.unreadCount)

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      current: location.pathname === '/dashboard',
    },
    {
      name: 'Strategy Engine',
      href: '/strategy',
      icon: Target,
      current: location.pathname === '/strategy',
    },
    {
      name: 'Backtesting',
      href: '/backtesting',
      icon: TrendingUp,
      current: location.pathname === '/backtesting',
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: Briefcase,
      current: location.pathname === '/portfolio',
    },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: Bell,
      current: location.pathname === '/alerts',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
  ]

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-2">
                <h1 className="text-xl font-bold text-gray-900">CoinTactix</h1>
              </div>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <Sidebar navigation={navigation} onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-2">
                <h1 className="text-xl font-bold text-gray-900">CoinTactix</h1>
              </div>
            </div>
          </div>
          <Sidebar navigation={navigation} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
