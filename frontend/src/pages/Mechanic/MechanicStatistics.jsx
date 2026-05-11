import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Star, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'

const MechanicStatistics = () => {
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token')

      const bookingsResponse = await fetch(`http://localhost:5000/api/bookings/mechanic/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const bookingsData = await bookingsResponse.json()

      if (bookingsResponse.ok) {
        setBookings(bookingsData.bookings || [])
        
        // Calculate stats
        const totalBookings = bookingsData.bookings.length
        const completedBookings = bookingsData.bookings.filter(b => b.status === 'completed').length
        const pendingBookings = bookingsData.bookings.filter(b => b.status === 'pending').length
        const inProgressBookings = bookingsData.bookings.filter(b => b.status === 'in_progress').length
        const cancelledBookings = bookingsData.bookings.filter(b => b.status === 'cancelled').length
        
        const totalRevenue = bookingsData.bookings
          .filter(b => b.status === 'completed' && b.pricing?.finalCost)
          .reduce((sum, b) => sum + (b.pricing.finalCost || 0), 0)
        
        const estimatedRevenue = bookingsData.bookings
          .filter(b => b.pricing?.estimatedCost)
          .reduce((sum, b) => sum + (b.pricing.estimatedCost || 0), 0)
        
        const completionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0
        
        // Fetch mechanic's rating from API
        let averageRating = 0
        let totalReviews = 0
        try {
          const ratingResponse = await fetch(`http://localhost:5000/api/bookings/mechanic/${user.id}/average-rating`)
          const ratingData = await ratingResponse.json()
          if (ratingResponse.ok) {
            averageRating = ratingData.average
            totalReviews = ratingData.count
          }
        } catch (error) {
          console.error('Error fetching rating:', error)
        }
        
        // Monthly stats (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const recentBookings = bookingsData.bookings.filter(b => new Date(b.createdAt) >= thirtyDaysAgo)
        const monthlyRevenue = recentBookings
          .filter(b => b.status === 'completed' && b.pricing?.finalCost)
          .reduce((sum, b) => sum + (b.pricing.finalCost || 0), 0)
        
        setStats({
          totalBookings,
          completedBookings,
          pendingBookings,
          inProgressBookings,
          cancelledBookings,
          totalRevenue,
          estimatedRevenue,
          completionRate,
          averageRating,
          totalReviews,
          monthlyRevenue,
          recentBookings: recentBookings.length
        })
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">No statistics available</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Statistics & Analytics</h1>
          <p className="text-gray-600 mt-2">Track your business performance and growth</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-success-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Booking Status</h2>
              <p className="card-description">Breakdown of all your bookings</p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                    <span className="text-gray-700">Completed</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.completedBookings}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-warning-600 mr-2" />
                    <span className="text-gray-700">In Progress</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.inProgressBookings}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-warning-600 mr-2" />
                    <span className="text-gray-700">Pending</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.pendingBookings}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-error-600 rounded-full mr-2"></div>
                    <span className="text-gray-700">Cancelled</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.cancelledBookings}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Completion Rate</span>
                    <span className="font-bold text-primary-600">{stats.completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Revenue Overview</h2>
              <p className="card-description">Your earnings summary</p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Revenue</span>
                  <span className="font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Monthly Revenue (Last 30 days)</span>
                  <span className="font-bold text-primary-600">${stats.monthlyRevenue.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Estimated Revenue</span>
                  <span className="font-bold text-gray-600">${stats.estimatedRevenue.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Average per Booking</span>
                    <span className="font-bold text-gray-900">
                      ${stats.completedBookings > 0 ? (stats.totalRevenue / stats.completedBookings).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.recentBookings}</p>
                <p className="text-sm text-gray-600">Last 30 Days</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.completedBookings > 0 ? (stats.totalRevenue / stats.completedBookings).toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-gray-600">Avg. per Service</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Performance Insights</h2>
            <p className="card-description">Key metrics and recommendations</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {stats.completionRate > 80 && (
                    <li className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
                      High completion rate ({stats.completionRate}%)
                    </li>
                  )}
                  {stats.averageRating >= 4.5 && (
                    <li className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-500 mr-2" />
                      Excellent customer ratings ({stats.averageRating.toFixed(1)}⭐)
                    </li>
                  )}
                  {stats.monthlyRevenue > 1000 && (
                    <li className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      Strong monthly revenue (${stats.monthlyRevenue.toFixed(2)})
                    </li>
                  )}
                  {stats.recentBookings >= 10 && (
                    <li className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 text-primary-600 mr-2" />
                      Consistent booking flow ({stats.recentBookings} this month)
                    </li>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Areas for Improvement</h3>
                <ul className="space-y-2">
                  {stats.completionRate < 70 && (
                    <li className="flex items-center text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4 text-warning-600 mr-2" />
                      Consider improving completion rate
                    </li>
                  )}
                  {stats.averageRating < 4.0 && (
                    <li className="flex items-center text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4 text-warning-600 mr-2" />
                      Focus on improving customer satisfaction
                    </li>
                  )}
                  {stats.pendingBookings > 5 && (
                    <li className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-warning-600 mr-2" />
                      Several pending bookings need attention
                    </li>
                  )}
                  {stats.totalReviews < 10 && (
                    <li className="flex items-center text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4 text-warning-600 mr-2" />
                      Encourage more customer reviews
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MechanicStatistics
