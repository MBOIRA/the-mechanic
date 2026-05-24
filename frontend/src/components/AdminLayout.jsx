import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  LogOut,
  Bell,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  CreditCard
} from 'lucide-react'

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Support / Inquiries', href: '/admin/support', icon: MessageSquare },
    { name: 'Profile', href: '/admin/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="font-black text-gray-900 tracking-tight uppercase">Admin<span className="text-primary-500">Panel</span></span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-950 text-white border-r border-gray-900">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-6 border-b border-gray-900">
              <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
                <div className="bg-primary-500 p-2 rounded-lg group-hover:bg-primary-600 transition-colors shadow-sm">
                  <ShieldAlert className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black text-white tracking-tight uppercase">Admin<span className="text-primary-500">Panel</span></span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-bold transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
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
            <div className="p-4 border-t border-gray-900">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-900 rounded-xl border border-gray-800">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-white" />
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
                className="flex items-center space-x-2 w-full px-3 py-3 rounded-lg text-sm font-bold text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
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
            <aside className="fixed inset-y-0 left-0 w-64 bg-gray-950 text-white shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-900">
                  <span className="font-black text-white tracking-tight uppercase">Menu</span>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-md text-gray-400 hover:bg-gray-800"
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
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-bold transition-colors ${
                        location.pathname.startsWith(item.href)
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-gray-900">
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsSidebarOpen(false)
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-3 rounded-lg text-sm font-bold text-gray-400 hover:bg-red-500 hover:text-white"
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
        <main className="flex-1 md:ml-64">
          {/* Desktop Header */}
          <header className="hidden md:flex items-center justify-end px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 p-2 bg-gray-100 rounded-xl border border-gray-200">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center overflow-hidden shadow-sm">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="text-sm pr-2">
                  <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 font-medium">Super Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
