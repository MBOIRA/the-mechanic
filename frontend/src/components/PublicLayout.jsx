import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  Phone, 
  ChevronDown,
  Car,
  ShieldAlert,
  Settings
} from 'lucide-react'

const PublicLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Change nav style on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsServicesOpen(false)
  }, [location.pathname])

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
        { name: 'Get Mechanics', href: '/mechanics', icon: <Car className="w-4 h-4 mr-2" /> },
        { name: 'Emergency', href: '/emergency', icon: <ShieldAlert className="w-4 h-4 mr-2 text-red-500" /> }
      ]
    },
    { name: 'Support', href: '/inquiries' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white shadow-md py-2' 
            : 'bg-white/90 backdrop-blur-md border-b border-gray-200 py-4'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-primary-500 p-2 rounded-lg group-hover:bg-primary-600 transition-colors">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                Mechanics<span className="text-primary-500">Hub</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.children ? (
                    <div className="relative">
                      <button
                        onMouseEnter={() => setIsServicesOpen(true)}
                        onMouseLeave={() => setIsServicesOpen(false)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md hover:bg-gray-50 transition-all"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      
                      {/* Dropdown with invisible bridge to prevent closing when moving mouse */}
                      {isServicesOpen && (
                        <div 
                          className="absolute left-0 mt-0 pt-2 w-56 z-50"
                          onMouseEnter={() => setIsServicesOpen(true)}
                          onMouseLeave={() => setIsServicesOpen(false)}
                        >
                          <div className="rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 overflow-hidden border border-gray-100">
                            <div className="p-2 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.name}
                                  to={child.href}
                                  className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                                >
                                  {child.icon}
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className="text-gray-600 hover:text-primary-600 px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md hover:bg-gray-50 transition-all"
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
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 border-r border-gray-300 pr-4">
                    Welcome, <span className="font-bold text-gray-900">{user?.firstName}</span>
                  </span>
                  <Link
                    to={user?.role === 'client' ? "/client/dashboard" : user?.role === 'mechanic' ? "/mechanic/dashboard" : "/admin/dashboard"}
                    className="px-5 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-md"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/create-account"
                    state={{ isLogin: true }}
                    className="px-5 py-2 text-gray-700 font-bold hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/create-account"
                    className="px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-500 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-primary-600 p-2 rounded-md focus:outline-none"
              >
                {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pt-2 pb-6 space-y-2 bg-white border-b border-gray-200 shadow-inner">
            {navigation.map((item) => (
              <div key={item.name} className="py-1">
                {item.children ? (
                  <div>
                    <button
                      onClick={() => setIsServicesOpen(!isServicesOpen)}
                      className="flex items-center justify-between w-full px-3 py-3 text-base font-bold text-gray-800 rounded-lg hover:bg-gray-50"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`pl-4 space-y-1 mt-1 overflow-hidden transition-all ${isServicesOpen ? 'max-h-40' : 'max-h-0'}`}>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className="flex items-center px-4 py-3 text-sm font-semibold text-gray-600 hover:text-primary-600 rounded-lg"
                        >
                          {child.icon}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className="block px-3 py-3 text-base font-bold text-gray-800 rounded-lg hover:bg-gray-50"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="pt-6 mt-4 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="px-3 py-2 text-sm text-gray-500 uppercase tracking-wider font-bold">
                    Account ({user?.firstName})
                  </div>
                  <Link
                    to={user?.role === 'client' ? "/client/dashboard" : user?.role === 'mechanic' ? "/mechanic/dashboard" : "/admin/dashboard"}
                    className="flex justify-center w-full px-4 py-3 bg-gray-900 text-white font-bold rounded-lg"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex justify-center w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/create-account"
                    state={{ isLogin: true }}
                    className="flex justify-center w-full px-4 py-3 bg-gray-100 text-gray-900 font-bold rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/create-account"
                    className="flex justify-center w-full px-4 py-3 bg-primary-600 text-white font-bold rounded-lg shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (with top padding to account for fixed header) */}
      <main className="flex-1 pt-[72px]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="col-span-1 lg:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-6 group">
                <div className="bg-primary-500 p-2 rounded-lg group-hover:bg-primary-600 transition-colors">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight uppercase">
                  Mechanics<span className="text-primary-500">Hub</span>
                </span>
              </Link>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                The industry standard platform for connecting drivers with qualified, vetted mechanics for all vehicle service needs and emergencies.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-gray-900 p-3 rounded-full border border-gray-800">
                  <Phone className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">24/7 Emergency Line</div>
                  <div className="text-lg text-white font-bold">1-800-MECHANIC</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link to="/mechanics" className="text-gray-400 hover:text-primary-500 transition-colors">Find Mechanics</Link></li>
                <li><Link to="/emergency" className="text-gray-400 hover:text-red-500 transition-colors flex items-center"><ShieldAlert className="w-4 h-4 mr-2"/> Emergency</Link></li>
                <li><Link to="/inquiries" className="text-gray-400 hover:text-primary-500 transition-colors">Support Center</Link></li>
                <li><Link to="/create-account" className="text-gray-400 hover:text-primary-500 transition-colors">Join as a Mechanic</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Top Services</h3>
              <ul className="space-y-4">
                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Engine Diagnostics</li>
                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Brake Replacement</li>
                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Transmission Repair</li>
                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer">Routine Maintenance</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} Mechanics Hub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-white text-sm font-medium transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-white text-sm font-medium transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
