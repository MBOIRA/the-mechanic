import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import { 
  Calendar, 
  Star, 
  Clock,
  CheckCircle,
  AlertCircle,
  Car,
  DollarSign,
  Filter
} from 'lucide-react'

const ClientHistory = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('completed,cancelled')

  useEffect(() => {
    fetchBookings()
  }, [filterStatus])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings?status=${filterStatus}`, {
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

  const filteredBookings = bookings

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking history...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Service History</h1>
          <p className="text-gray-600 mt-2">View your past and current vehicle service bookings</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                className="input w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="completed,cancelled">All History</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div 
                key={booking._id} 
                className="card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/client/bookings/${booking._id}`)}
              >
                <div className="card-header">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.service?.name || 'Service'}
                      </h3>
                      <p className="text-gray-600">
                        {booking.mechanic?.businessName || 'Mechanic'}
                      </p>
                    </div>
                    <span className={getStatusColor(booking.status)}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="card-content">
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
                        <p className="text-sm text-gray-600">Mechanic's shop</p>
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

                  {/* Notes */}
                  {booking.notes && booking.notes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                      <div className="space-y-2">
                        {booking.notes.map((note, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {note.author?.firstName} {note.author?.lastName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(note.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'completed,cancelled' 
                ? "You haven't completed any bookings yet." 
                : `No ${filterStatus.replace('_', ' ')} bookings found.`}
            </p>
            <button
              onClick={() => window.location.href = '/client/get-mechanic'}
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

export default ClientHistory
