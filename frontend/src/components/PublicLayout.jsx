import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  Wrench, 
  Phone, 
  MapPin, 
  Star,
  Shield,
  Clock,
  ChevronDown
} from 'lucide-react'

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { 
      name: 'Services', 
      href: '#',
      children: [
        { name: 'Get Mechanics', href: '/mechanics' },
        { name: 'Emergency', href: '/emergency' }
      ]
    },
    { name: 'Support', href: '/inquiries' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Mechanics Hub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.children ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsServicesOpen(!isServicesOpen)}
                        className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      {isServicesOpen && (
                        <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                to={child.href}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsServicesOpen(false)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName}
                  </span>
                  {user?.role === 'client' && (
                    <Link
                      to="/client/dashboard"
                      className="btn-primary"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user?.role === 'mechanic' && (
                    <Link
                      to="/mechanic/dashboard"
                      className="btn-primary"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="btn-outline"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/create-account"
                    state={{ isLogin: true }}
                    className="btn-primary"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-primary-600 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => setIsServicesOpen(!isServicesOpen)}
                          className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium w-full text-left"
                        >
                          <span>{item.name}</span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        {isServicesOpen && (
                          <div className="pl-6 space-y-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                to={child.href}
                                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary-600"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 pb-3 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-600">
                        Welcome, {user?.firstName}
                      </div>
                      {user?.role === 'client' && (
                        <Link
                          to="/client/dashboard"
                          className="btn-primary w-full mb-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      {user?.role === 'mechanic' && (
                        <Link
                          to="/mechanic/dashboard"
                          className="btn-primary w-full mb-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                        className="btn-outline w-full"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/create-account"
                        state={{ isLogin: true }}
                        className="btn-primary w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">Mechanics Hub</span>
              </div>
              <p className="text-gray-300 mb-4">
                Your trusted platform for connecting with qualified mechanics for all your vehicle service needs.
              </p>
              <div className="flex space-x-4">
                <Phone className="h-5 w-5 text-primary-400" />
                <span className="text-gray-300">24/7 Support</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/mechanics" className="text-gray-300 hover:text-white">Find Mechanics</Link></li>
                <li><Link to="/emergency" className="text-gray-300 hover:text-white">Emergency Services</Link></li>
                <li><Link to="/inquiries" className="text-gray-300 hover:text-white">Support</Link></li>
                <li><Link to="/create-account" className="text-gray-300 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">Engine Repair</li>
                <li className="text-gray-300">Brake Service</li>
                <li className="text-gray-300">Oil Change</li>
                <li className="text-gray-300">Emergency Assistance</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Mechanics Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
