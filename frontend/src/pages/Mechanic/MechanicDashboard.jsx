import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar, 
  Wrench, 
  Star, 
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Users,
  TrendingUp,
  Car,
  MapPin,
  Phone,
  Mail,
  BarChart3,
  Activity,
  Target,
  Award,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  FileText,
  MessageSquare
} from 'lucide-react'

const MechanicDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [emergencyAvailable, setEmergencyAvailable] = useState(user?.emergencyAvailable || false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/mechanic/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEmergency = async () => {
    try {
      const newStatus = !emergencyAvailable
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ emergencyAvailable: newStatus })
      })

      if (response.ok) {
        setEmergencyAvailable(newStatus)
      }
    } catch (error) {
      console.error('Error toggling emergency availability:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-sm'
      case 'confirmed': return 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-sm'
      case 'in_progress': return 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-sm'
      case 'completed': return 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-sm'
      case 'cancelled': return 'bg-gradient-to-r from-red-400 to-rose-400 text-white shadow-sm'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <Calendar className="h-4 w-4" />
      case 'in_progress': return <Activity className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const calculateStats = () => {
    const totalBookings = bookings.length
    const completedBookings = bookings.filter(b => b.status === 'completed').length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const inProgressBookings = bookings.filter(b => b.status === 'in_progress').length
    const totalRevenue = bookings
      .filter(b => b.status === 'completed' && b.pricing?.finalCost)
      .reduce((sum, b) => sum + (b.pricing.finalCost || 0), 0)
    
    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      inProgressBookings,
      totalRevenue,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0
    }
  }

  const stats = calculateStats()

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.client?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || booking.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mr-4">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">Mechanic Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName || 'Mechanic'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-11 pr-4 py-2.5 w-72 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Emergency Toggle */}
              <button
                onClick={handleToggleEmergency}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  emergencyAvailable 
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-transparent shadow-lg hover:shadow-xl transform hover:scale-105' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-200 hover:from-gray-200 hover:to-gray-300'
                }`}
              >
                <Zap className={`h-4 w-4 mr-2 ${emergencyAvailable ? 'text-white fill-current' : 'text-gray-500'}`} />
                {emergencyAvailable ? 'Emergency: ON' : 'Emergency: OFF'}
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                {stats.pendingBookings > 0 && (
                  <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full shadow-sm"></span>
                )}
              </button>
              
              {/* Profile */}
              <div className="flex items-center space-x-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.firstName || 'Mechanic'} {user?.lastName || 'User'}</p>
                  <p className="text-xs text-gray-600">Mechanic</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.[0] || 'M'}{user?.lastName?.[0] || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mt-1">{stats.totalBookings}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">12% from last month</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-md">
                <Calendar className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Pending Requests</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mt-1">{stats.pendingBookings}</p>
                <div className="flex items-center mt-2 text-sm">
                  <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 font-medium">Need attention</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-md">
                <AlertCircle className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">${stats.totalRevenue.toFixed(2)}</p>
                <div className="flex items-center mt-2 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">8% increase</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-md">
                <DollarSign className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">{stats.completionRate}%</p>
                <div className="flex items-center mt-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600 font-medium">Excellent</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-md">
                <Target className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/mechanic/profile"
              className="flex flex-col items-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:shadow-md"
            >
              <Edit className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">Edit Profile</span>
            </Link>
            
            <Link
              to="/mechanic/notifications"
              className="flex flex-col items-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:shadow-md relative"
            >
              <Bell className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">Notifications</span>
              {stats.pendingBookings > 0 && (
                <span className="absolute top-3 right-3 h-6 w-6 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs rounded-full flex items-center justify-center shadow-md">
                  {stats.pendingBookings}
                </span>
              )}
            </Link>
            
            <Link
              to="/mechanic/statistics"
              className="flex flex-col items-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:shadow-md"
            >
              <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">Statistics</span>
            </Link>
            
            <Link
              to="/mechanic/subscription"
              className="flex flex-col items-center p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:shadow-md"
            >
              <Award className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">Subscription</span>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">Recent Bookings</h2>
              <div className="flex items-center space-x-3">
                <select
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <Link
                  to="/mechanic/bookings"
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {filteredBookings.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gradient-to-r from-blue-50 to-indigo-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                            <span className="text-sm font-bold text-blue-600">
                              {booking.client?.firstName?.[0]}{booking.client?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {booking.client?.firstName} {booking.client?.lastName}
                            </div>
                            <div className="text-sm text-gray-600">{booking.client?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{booking.service || 'Service'}</div>
                        <div className="text-sm text-gray-600">${booking.pricing?.estimatedCost || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {booking.vehicle?.make} {booking.vehicle?.model}
                        </div>
                        <div className="text-sm text-gray-600">{booking.vehicle?.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{formatDate(booking.scheduledDate)}</div>
                        <div className="text-sm text-gray-600">{formatTime(booking.scheduledTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                  <Calendar className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'You\'ll see bookings here when clients book your services'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default MechanicDashboard
