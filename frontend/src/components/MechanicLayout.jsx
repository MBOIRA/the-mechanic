import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Bell, 
  User, 
  BarChart3,
  LogOut,
  Search,
  ChevronRight,
  Wrench,
  Settings,
  Calendar,
  History,
  HelpCircle
} from 'lucide-react'

const MechanicLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/mechanic/dashboard', icon: LayoutDashboard },
    { name: 'Bookings', href: '/mechanic/bookings', icon: Calendar },
    { name: 'History', href: '/mechanic/history', icon: History },
    { name: 'Notifications', href: '/mechanic/notifications', icon: Bell },
    { name: 'Profile', href: '/mechanic/profile', icon: User },
    { name: 'Statistics', href: '/mechanic/statistics', icon: BarChart3 },
    { name: 'Subscription', href: '/mechanic/subscription', icon: Settings },
    { name: 'Support', href: '/inquiries', icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="font-black text-gray-900 tracking-tight uppercase">Mechanics<span className="text-primary-500">Hub</span></span>
          <Link to="/mechanic/notifications" className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
            <Bell className="h-6 w-6" />
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex md:flex-col md:w-72 md:fixed md:inset-y-0 bg-gray-900 border-r border-gray-800 shadow-xl">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-6 border-b border-gray-800">
              <Link to="/mechanic/dashboard" className="flex items-center space-x-3 group">
                <div className="bg-primary-500 p-2 rounded-lg group-hover:bg-primary-600 transition-colors shadow-sm">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight uppercase">Mechanics<span className="text-primary-500">Hub</span></span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md transform scale-[1.02]'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                )
              })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-800 rounded-xl border border-gray-700">
                <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden shadow-sm">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400 font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <aside className="fixed inset-y-0 left-0 w-72 bg-gray-900 shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                  <span className="font-black text-white tracking-tight uppercase">Menu</span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                        location.pathname === item.href
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-gray-800">
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsSidebarOpen(false)
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 md:ml-72">
          {/* Desktop Header */}
          <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-11 pr-4 py-2.5 w-72 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/mechanic/notifications" className="p-2.5 rounded-xl text-gray-600 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 relative">
                <Bell className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-3 p-2 bg-gray-100 rounded-xl border border-gray-200">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden shadow-sm">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 font-medium">Mechanic</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MechanicLayout
