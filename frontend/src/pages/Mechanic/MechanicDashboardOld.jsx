import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { bookingsAPI, mechanicsAPI } from '../../services/api'
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
  Tool,
  FileText,
  MessageSquare
} from 'lucide-react'

const MechanicDashboard = () => {
  const { user } = useAuth()
  const [recentBookings, setRecentBookings] = useState([])
  const [mechanicProfile, setMechanicProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [bookingsResponse, profileResponse] = await Promise.all([
        bookingsAPI.getAll({ limit: 5 }),
        mechanicsAPI.getMyProfile()
      ])
      
      setRecentBookings(bookingsResponse.data.bookings)
      setMechanicProfile(profileResponse.data.mechanic)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
    const totalBookings = recentBookings.length
    const completedBookings = recentBookings.filter(b => b.status === 'completed').length
    const pendingBookings = recentBookings.filter(b => b.status === 'pending').length
    const inProgressBookings = recentBookings.filter(b => b.status === 'in_progress').length
    const totalRevenue = recentBookings
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

  const filteredBookings = recentBookings.filter(booking => {
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your service bookings and grow your mechanic business.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link
            to="/mechanic/profile"
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">My Profile</h3>
                <p className="text-sm text-gray-600">Update business info</p>
              </div>
            </div>
          </Link>

          <Link
            to="/mechanic/notifications"
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">View new bookings</p>
              </div>
            </div>
          </Link>

          <Link
            to="/mechanic/statistics"
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Statistics</h3>
                <p className="text-sm text-gray-600">View performance</p>
              </div>
            </div>
          </Link>

          <Link
            to="/mechanic/subscription"
            className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Subscription</h3>
                <p className="text-sm text-gray-600">Manage plan</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {recentBookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length}
                </p>
                <p className="text-sm text-gray-600">New Bookings</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-warning-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {recentBookings.filter(b => b.status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-success-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {recentBookings.filter(b => b.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mechanicProfile?.rating?.average?.toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Bookings</h2>
              <p className="card-description">Latest service requests from clients</p>
            </div>
            <div className="card-content">
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {booking.service?.name || 'Service'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {booking.client?.firstName} {booking.client?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.vehicle?.make} {booking.vehicle?.model}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(booking.scheduledDate)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {booking.scheduledTime}
                            </div>
                          </div>
                        </div>
                        <span className={getStatusColor(booking.status)}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-gray-600">
                    Clients will start booking your services soon.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Business Profile</h2>
              <p className="card-description">Your mechanic business information</p>
            </div>
            <div className="card-content">
              {mechanicProfile ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {mechanicProfile.businessName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {mechanicProfile.location.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      {mechanicProfile.location.city}, {mechanicProfile.location.state}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {mechanicProfile.specialization.slice(0, 3).map((spec, index) => (
                        <span key={index} className="badge-info text-xs">
                          {spec}
                        </span>
                      ))}
                      {mechanicProfile.specialization.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{mechanicProfile.specialization.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-medium text-gray-900">
                        {mechanicProfile.experience} years
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hourly Rate</p>
                      <p className="font-medium text-gray-900">
                        ${mechanicProfile.pricing?.hourlyRate}/hr
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Jobs</p>
                      <p className="font-medium text-gray-900">
                        {mechanicProfile.rating?.count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-gray-900">
                        {mechanicProfile.isAvailable ? 'Available' : 'Busy'}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to="/mechanic/profile"
                    className="btn-primary w-full"
                  >
                    Edit Profile
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Profile Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your mechanic profile to start receiving bookings.
                  </p>
                  <Link
                    to="/mechanic/profile"
                    className="btn-primary"
                  >
                    Create Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MechanicDashboard
