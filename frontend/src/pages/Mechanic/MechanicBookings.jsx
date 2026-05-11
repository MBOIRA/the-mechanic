import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Calendar, 
  Star, 
  Clock,
  CheckCircle,
  AlertCircle,
  Car,
  DollarSign,
  Filter,
  ChevronRight
} from 'lucide-react'

const MechanicBookings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending,confirmed,in_progress')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchBookings()
    // Auto-refresh bookings every 30 seconds
    const interval = setInterval(fetchBookings, 30000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/mechanic/${user.id}?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const handleViewBooking = (bookingId) => {
    navigate(`/mechanic/bookings/${bookingId}`)
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdating(bookingId)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your service bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                className="input w-auto"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="pending,confirmed,in_progress">All Active</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {bookings.length} bookings
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'pending,confirmed,in_progress' 
                ? "You don't have any active bookings." 
                : `No ${filter.replace('_', ' ')} bookings found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="card-header">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.service}
                      </h3>
                      <p className="text-gray-600">
                        {booking.client?.firstName} {booking.client?.lastName}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="card-content" onClick={() => handleViewBooking(booking._id)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Vehicle Info */}
                    <div>
                      <div className="flex items-center mb-2">
                        <Car className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Vehicle</span>
                      </div>
                      <p className="text-gray-900">
                        {booking.vehicle?.make} {booking.vehicle?.model}
                      </p>
                      <p className="text-sm text-gray-600">{booking.vehicle?.year}</p>
                      {booking.vehicle?.vin && (
                        <p className="text-xs text-gray-500">VIN: {booking.vehicle.vin}</p>
                      )}
                    </div>

                    {/* Schedule */}
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Schedule</span>
                      </div>
                      <p className="text-gray-900">{formatDate(booking.scheduledDate)}</p>
                      <p className="text-sm text-gray-600">{booking.scheduledTime}</p>
                      <p className="text-xs text-gray-500">
                        Duration: {booking.estimatedDuration} minutes
                      </p>
                    </div>

                    {/* Location */}
                    <div>
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Location</span>
                      </div>
                      <p className="text-gray-900 capitalize">{booking.location?.type}</p>
                      {booking.location?.type === 'mobile' && booking.location?.address && (
                        <p className="text-sm text-gray-600">{booking.location.address}</p>
                      )}
                      {booking.location?.type === 'shop' && (
                        <p className="text-sm text-gray-600">Your shop</p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div>
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Cost</span>
                      </div>
                      <p className="text-gray-900">
                        ${booking.pricing?.estimatedCost || 0}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {booking.pricing?.paymentStatus || 'pending'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {booking.description && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Problem Description</h4>
                      <p className="text-gray-600">{booking.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {booking.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(booking._id, 'confirmed')
                          }}
                          disabled={updating === booking._id}
                          className="btn-primary flex-1"
                        >
                          {updating === booking._id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(booking._id, 'cancelled')
                          }}
                          disabled={updating === booking._id}
                          className="btn-secondary flex-1"
                        >
                          {updating === booking._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(booking._id, 'in_progress')
                          }}
                          disabled={updating === booking._id}
                          className="btn-primary flex-1"
                        >
                          {updating === booking._id ? 'Starting...' : 'Start Service'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(booking._id, 'cancelled')
                          }}
                          disabled={updating === booking._id}
                          className="btn-secondary flex-1"
                        >
                          {updating === booking._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    )}
                    {booking.status === 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(booking._id, 'completed')
                        }}
                        disabled={updating === booking._id}
                        className="btn-primary w-full"
                      >
                        {updating === booking._id ? 'Completing...' : 'Service Complete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MechanicBookings
