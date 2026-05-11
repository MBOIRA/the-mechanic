import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  MapPin, 
  Phone, 
  Star, 
  AlertTriangle,
  ArrowLeft,
  Clock,
  Car,
  CheckCircle
} from 'lucide-react'

const EmergencyMechanics = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const [mechanics, setMechanics] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null })
  const [formData, setFormData] = useState(location.state?.formData || {})

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          fetchMechanics(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Fetch all mechanics without location filtering
          fetchMechanics()
        }
      )
    } else {
      fetchMechanics()
    }
  }, [])

  const fetchMechanics = async (userLat = null, userLng = null) => {
    try {
      const response = await fetch('http://localhost:5000/api/mechanics')
      const data = await response.json()
      if (response.ok) {
        let mechanicsList = data.mechanics || []

        // Calculate distances if user location is available
        if (userLat !== null && userLng !== null) {
          mechanicsList = mechanicsList.map(mech => {
            if (mech.location?.coordinates?.lat && mech.location?.coordinates?.lng) {
              const distance = calculateDistance(
                userLat,
                userLng,
                mech.location.coordinates.lat,
                mech.location.coordinates.lng
              )
              return { ...mech, distance }
            }
            return { ...mech, distance: Infinity }
          })
        }

        // Sort: Emergency-ready mechanics first, then by distance
        mechanicsList.sort((a, b) => {
          // Emergency-ready mechanics get priority
          if (a.emergencyAvailable && !b.emergencyAvailable) return -1
          if (!a.emergencyAvailable && b.emergencyAvailable) return 1
          
          // Then sort by distance (nearest first)
          if (a.distance !== Infinity && b.distance !== Infinity) {
            return a.distance - b.distance
          }
          if (a.distance === Infinity && b.distance !== Infinity) return 1
          if (a.distance !== Infinity && b.distance === Infinity) return -1
          return 0
        })

        setMechanics(mechanicsList)
      }
    } catch (error) {
      console.error('Error fetching mechanics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const formatDistance = (distance) => {
    if (distance === Infinity) return 'Unknown'
    if (distance < 1) return `${(distance * 5280).toFixed(0)} ft away`
    return `${distance.toFixed(1)} miles away`
  }

  const selectMechanic = (mechanic) => {
    const updatedFormData = {
      ...formData,
      mechanic: mechanic._id,
      mechanicSelectionType: 'manual'
    }
    navigate(isAuthenticated ? '/client/emergency' : '/emergency', { state: { formData: updatedFormData } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Finding mechanics near you...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(isAuthenticated ? '/client/emergency' : '/emergency')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Emergency Form
          </button>
          <div className="flex items-center">
            <MapPin className="h-10 w-10 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mechanics Near You</h1>
              <p className="text-gray-600 mt-1">
                {userLocation.lat ? 'Ranked by distance from your location' : 'Available mechanics'}
              </p>
            </div>
          </div>
        </div>

        {mechanics.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-yellow-900 mb-2">No Mechanics Found</h3>
            <p className="text-yellow-800">
              There are no mechanics available at this time. Please try again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanics.map((mechanic, index) => (
              <div key={mechanic._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Priority Badge */}
                  <div className="flex items-center justify-between mb-4">
                    {index === 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Nearest
                      </span>
                    )}
                    {mechanic.emergencyAvailable && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Emergency Ready
                      </span>
                    )}
                  </div>

                  {/* Distance */}
                  {mechanic.distance !== Infinity && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {formatDistance(mechanic.distance)}
                    </div>
                  )}

                  {/* Name & Business */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {mechanic.firstName} {mechanic.lastName}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {mechanic.businessName || 'Independent Mechanic'}
                  </p>

                  {/* Location */}
                  {mechanic.location && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {mechanic.location.city && `${mechanic.location.city}, `}
                      {mechanic.location.state}
                    </div>
                  )}

                  {/* Rating */}
                  {mechanic.rating && typeof mechanic.rating === 'number' && (
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm text-gray-700">{mechanic.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Specializations */}
                  {mechanic.specialization && mechanic.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {mechanic.specialization.slice(0, 3).map((spec, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {spec}
                        </span>
                      ))}
                      {mechanic.specialization.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{mechanic.specialization.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => selectMechanic(mechanic)}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Select This Mechanic
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Emergency Service Notice</h3>
              <p className="text-sm text-blue-800 mt-1">
                Mechanics marked as "Emergency Ready" have opted to receive emergency requests. 
                If no emergency-ready mechanics are available in your area, nearby mechanics will still be notified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyMechanics
