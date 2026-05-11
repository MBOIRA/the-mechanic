import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  Bell, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Car,
  MapPin,
  Phone,
  User,
  Star,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const MechanicNotifications = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchNotifications()
    fetchBookings()
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications()
      fetchBookings()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/bookings/mechanic/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdating(bookingId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchBookings()
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning'
      case 'confirmed': return 'badge-info'
      case 'in_progress': return 'badge-warning'
      case 'completed': return 'badge-success'
      case 'cancelled': return 'badge-error'
      default: return 'badge-info'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const inProgressBookings = bookings.filter(b => b.status === 'in_progress')
  const completedBookings = bookings.filter(b => b.status === 'completed' && b.rating)
  const messageNotifications = notifications.filter(n => n.type === 'message')
  const emergencyNotifications = notifications.filter(n => n.type === 'emergency')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with new booking requests and service updates</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="card p-6 border-l-4 border-warning-500">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-warning-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-info-500">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-info-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{confirmedBookings.length}</p>
                <p className="text-sm text-gray-600">Confirmed Bookings</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-warning-500">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-warning-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{inProgressBookings.length}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedBookings.length}</p>
                <p className="text-sm text-gray-600">Completed with Ratings</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{messageNotifications.length}</p>
                <p className="text-sm text-gray-600">New Messages</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-l-4 border-red-600">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{emergencyNotifications.length}</p>
                <p className="text-sm text-gray-600">Emergency Requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-warning-600 mr-2" />
              New Booking Requests ({pendingBookings.length})
            </h2>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div key={booking._id} className="card border-l-4 border-warning-500">
                  <div className="card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {booking.service?.name || 'Service Request'}
                          </h3>
                          <span className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {booking.client?.firstName} {booking.client?.lastName}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Car className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatDate(booking.scheduledDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatTime(booking.scheduledTime)}
                            </span>
                          </div>
                        </div>

                        {booking.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <strong>Issue:</strong> {booking.description}
                            </p>
                          </div>
                        )}

                        {booking.location?.type === 'mobile' && booking.location?.address && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <strong>Service Location:</strong> {booking.location.address}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {booking.client?.phone}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              disabled={updating === booking._id}
                              className="btn-success text-sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {updating === booking._id ? 'Accepting...' : 'Accept'}
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              disabled={updating === booking._id}
                              className="btn-error text-sm"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Bookings */}
        {confirmedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-info-600 mr-2" />
              Upcoming Bookings ({confirmedBookings.length})
            </h2>
            <div className="space-y-4">
              {confirmedBookings.map((booking) => (
                <div key={booking._id} className="card border-l-4 border-info-500">
                  <div className="card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {booking.service?.name || 'Service'}
                          </h3>
                          <span className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {booking.client?.firstName} {booking.client?.lastName}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Car className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatDate(booking.scheduledDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatTime(booking.scheduledTime)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {booking.location?.type === 'mobile' ? booking.location?.address : 'Shop Location'}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="btn-warning text-sm">
                              <Clock className="h-4 w-4 mr-1" />
                              Start Service
                            </button>
                            <button className="btn-secondary text-sm">
                              Contact Client
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Bookings */}
        {inProgressBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-warning-600 mr-2" />
              Services in Progress ({inProgressBookings.length})
            </h2>
            <div className="space-y-4">
              {inProgressBookings.map((booking) => (
                <div key={booking._id} className="card border-l-4 border-warning-500">
                  <div className="card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {booking.service?.name || 'Service'}
                          </h3>
                          <span className={getStatusColor(booking.status)}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {booking.client?.firstName} {booking.client?.lastName}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Car className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatDate(booking.scheduledDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatTime(booking.scheduledTime)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Service is currently in progress
                          </div>
                          
                          <div className="flex space-x-2">
                            <button className="btn-success text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete Service
                            </button>
                            <button className="btn-secondary text-sm">
                              Add Note
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Notifications */}
        {messageNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
              New Messages ({messageNotifications.length})
            </h2>
            <div className="space-y-4">
              {messageNotifications.map((notification) => (
                <div key={notification._id} className="card border-l-4 border-purple-500 bg-purple-50">
                  <div className="card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        
                        {notification.metadata && notification.metadata.messageContent && (
                          <p className="text-sm text-gray-700 mb-3 italic">
                            "{notification.metadata.messageContent}"
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            From {notification.metadata?.clientName || 'Client'} • {new Date(notification.createdAt).toLocaleString()}
                          </div>
                          
                          {notification.metadata?.bookingId && (
                            <button 
                              onClick={() => navigate(`/mechanic/bookings/${notification.metadata.bookingId}`)}
                              className="btn-primary text-sm"
                            >
                              View Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Notifications */}
        {emergencyNotifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Emergency Requests ({emergencyNotifications.length})
            </h2>
            <div className="space-y-4">
              {emergencyNotifications.map((notification) => (
                <div key={notification._id} className="card border-l-4 border-red-600 bg-red-50">
                  <div className="card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                          <h3 className="text-lg font-semibold text-red-900">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full animate-pulse">
                              URGENT
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-red-800 mb-3">
                          {notification.message}
                        </p>

                        {notification.metadata && (
                          <div className="bg-white rounded-lg p-3 mb-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Type:</span>
                                <span className="ml-2 text-gray-900">{notification.metadata.emergencyType?.replace('_', ' ') || 'Emergency'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Location:</span>
                                <span className="ml-2 text-gray-900">{notification.metadata.location || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Service:</span>
                                <span className="ml-2 text-gray-900">{notification.metadata.service || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Client:</span>
                                <span className="ml-2 text-gray-900">{notification.metadata.clientName || 'Unknown'}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </div>
                          
                          {notification.metadata?.bookingId && (
                            <button 
                              onClick={() => navigate(`/mechanic/bookings/${notification.metadata.bookingId}`)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              View Emergency
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Bookings with Ratings */}
        {completedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 text-yellow-600 mr-2" />
              Completed Bookings with Ratings ({completedBookings.length})
            </h2>
            <div className="space-y-4">
              {completedBookings.map((booking) => (
                <div key={booking._id} className="card border-l-4 border-yellow-500">
                  <div className="card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {booking.service?.name || 'Service'}
                          </h3>
                          <span className="badge-success">
                            Completed
                          </span>
                        </div>
                        
                        <div className="flex items-center mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < booking.rating.score ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            ({booking.rating.score}/5)
                          </span>
                        </div>

                        {booking.rating.review && (
                          <p className="text-sm text-gray-600 mb-3">
                            "{booking.rating.review}"
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {booking.client?.firstName} {booking.client?.lastName}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Car className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {booking.vehicle?.make} {booking.vehicle?.model}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatDate(booking.scheduledDate)}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-900">
                              {formatTime(booking.scheduledTime)}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          Rated on {new Date(booking.rating.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Notifications */}
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600">
              You'll receive notifications here when clients book your services.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MechanicNotifications
