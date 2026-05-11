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
  Wrench,
  MessageSquare,
  AlertTriangle,
  Star,
  ChevronRight
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ClientNotifications = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchNotifications, 10000)
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

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return <Calendar className="h-5 w-5 text-blue-600" />
      case 'status_update': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'message': return <MessageSquare className="h-5 w-5 text-purple-600" />
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'rating': return <Star className="h-5 w-5 text-yellow-600" />
      case 'inquiry': return <MessageSquare className="h-5 w-5 text-indigo-600" />
      default: return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationBorderColor = (type) => {
    switch (type) {
      case 'booking': return 'border-blue-500'
      case 'status_update': return 'border-green-500'
      case 'message': return 'border-purple-500'
      case 'emergency': return 'border-red-600'
      case 'rating': return 'border-yellow-500'
      case 'inquiry': return 'border-indigo-500'
      default: return 'border-gray-500'
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    if (notification.type === 'inquiry') {
      navigate('/inquiries')
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl)
    } else if (notification.relatedId) {
      navigate(`/client/bookings/${notification.relatedId}`)
    }
  }

  const handleRateNow = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    if (notification.relatedId) {
      navigate(`/client/bookings/${notification.relatedId}`)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const bookingNotifications = notifications.filter(n => n.type === 'booking')
  const statusNotifications = notifications.filter(n => n.type === 'status_update')
  const messageNotifications = notifications.filter(n => n.type === 'message')
  const emergencyNotifications = notifications.filter(n => n.type === 'emergency')
  const ratingNotifications = notifications.filter(n => n.type === 'rating')
  const inquiryNotifications = notifications.filter(n => n.type === 'inquiry')

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
          <p className="text-gray-600 mt-2">Stay updated with your booking status and service updates</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="card p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-gray-900">{bookingNotifications.length}</p>
                <p className="text-xs text-gray-600">Bookings</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-gray-900">{statusNotifications.length}</p>
                <p className="text-xs text-gray-600">Status Updates</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-l-4 border-purple-500">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-purple-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-gray-900">{messageNotifications.length}</p>
                <p className="text-xs text-gray-600">Messages</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-l-4 border-red-600">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-gray-900">{emergencyNotifications.length}</p>
                <p className="text-xs text-gray-600">Emergency</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-gray-900">{ratingNotifications.length}</p>
                <p className="text-xs text-gray-600">Ratings</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
              <div>
                <p className="text-xl font-bold text-gray-900">{inquiryNotifications.length}</p>
                <p className="text-xs text-gray-600">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification._id} 
                className={`card border-l-4 ${getNotificationBorderColor(notification.type)} hover:shadow-md transition-shadow ${!notification.isRead ? 'bg-blue-50' : ''}`}
              >
                <div className="card-content">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex items-start space-x-3 flex-1 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <h3 className="text-base font-semibold text-gray-900 mr-2">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {notification.type === 'rating' && !notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRateNow(notification)
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          Rate Now
                        </button>
                      )}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 mb-4">
              You'll receive notifications here when your booking status changes or mechanics send messages.
            </p>
            <button
              onClick={() => navigate('/client/get-mechanic')}
              className="btn-primary"
            >
              Book a Service
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientNotifications
