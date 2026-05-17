import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { mechanicsAPI } from '../services/api'
import { 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Filter,
  Search,
  Wrench,
  DollarSign,
  Shield
} from 'lucide-react'

const MechanicsPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [mechanics, setMechanics] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [sortBy, setSortBy] = useState('rating')

  const specializations = [
    'Engine Repair',
    'Transmission',
    'Brakes',
    'Electrical',
    'AC & Heating',
    'Oil Change',
    'Tire Service',
    'Battery Service',
    'Diagnostics',
    'General Maintenance'
  ]

  useEffect(() => {
    fetchMechanics()
    // Check if a mechanic was just rated and refresh
    const lastRatedMechanic = localStorage.getItem('lastRatedMechanic')
    if (lastRatedMechanic) {
      fetchMechanics()
      localStorage.removeItem('lastRatedMechanic')
    }
  }, [selectedSpecialization, selectedLocation, sortBy])

  const fetchMechanics = async () => {
    try {
      setLoading(true)
      const params = {}
      
      if (selectedSpecialization) {
        params.specialization = selectedSpecialization
      }
      
      if (selectedLocation) {
        params.city = selectedLocation
      }
      
      if (sortBy === 'rating') {
        // API already sorts by rating by default
      }

      const response = await mechanicsAPI.getAll(params)
      setMechanics(response.data.mechanics)
    } catch (error) {
      console.error('Error fetching mechanics:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMechanics = mechanics.filter(mechanic => {
    const matchesSearch = searchTerm === '' || 
      (mechanic.businessName && mechanic.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mechanic.user?.firstName && mechanic.user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mechanic.user?.lastName && mechanic.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mechanic.location?.city && mechanic.location.city.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  const sortedMechanics = [...filteredMechanics].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating?.average || 0) - (a.rating?.average || 0)
      case 'price-low':
        return (a.pricing?.hourlyRate || 0) - (b.pricing?.hourlyRate || 0)
      case 'price-high':
        return (b.pricing?.hourlyRate || 0) - (a.pricing?.hourlyRate || 0)
      default:
        return 0
    }
  })

  const getAverageRating = (rating) => {
    return rating ? rating.average.toFixed(1) : '0.0'
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleBookService = (mechanicId) => {
    if (isAuthenticated && user?.role !== 'client') {
      alert('Only clients can book services')
      return
    }
    
    navigate(`/book/${mechanicId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mechanics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden mb-12 text-center py-20 px-4 shadow-2xl">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1920&q=80" 
              alt="Mechanic tools" 
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Find Qualified <span className="text-primary-500">Mechanics</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Connect with certified professionals in the Mechanics Hub network
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, business, or location..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Specialization Filter */}
            <div>
              <select
                className="input"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <input
                type="text"
                placeholder="City or location..."
                className="input"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Active Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedSpecialization && (
              <span className="badge-info flex items-center gap-1">
                {selectedSpecialization}
                <button
                  onClick={() => setSelectedSpecialization('')}
                  className="ml-1 text-xs hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedLocation && (
              <span className="badge-info flex items-center gap-1">
                {selectedLocation}
                <button
                  onClick={() => setSelectedLocation('')}
                  className="ml-1 text-xs hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Found {sortedMechanics.length} mechanic{sortedMechanics.length !== 1 ? 's' : ''}
          </p>
          <select
            className="input w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rating">Sort by Rating</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Mechanics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMechanics.map((mechanic) => (
            <div key={mechanic._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-header">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="card-title">{mechanic.businessName}</h3>
                    <p className="text-gray-600">
                      {mechanic.user.firstName} {mechanic.user.lastName}
                    </p>
                  </div>
                  {mechanic.isVerified && (
                    <div className="badge-success flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {getAverageRating(mechanic.rating)}
                    </span>
                  </div>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-600">
                    {mechanic.experience} years experience
                  </span>
                </div>
              </div>

              <div className="card-content">
                <div className="space-y-3">
                  {/* Location */}
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-900">{mechanic.location.address}</p>
                      <p className="text-gray-600">
                        {mechanic.location.city}, {mechanic.location.state}
                      </p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <div className="flex items-center mb-1">
                      <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Specializations</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mechanic.specialization.slice(0, 3).map((spec, index) => (
                        <span key={index} className="badge-info text-xs">
                          {spec}
                        </span>
                      ))}
                      {mechanic.specialization.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{mechanic.specialization.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {formatPrice(mechanic.pricing.hourlyRate)}/hour
                    </span>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className={`text-sm ${mechanic.isAvailable ? 'text-success-600' : 'text-gray-500'}`}>
                      {mechanic.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button 
                  onClick={() => handleBookService(mechanic._id)}
                  className="btn-primary w-full"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {sortedMechanics.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No mechanics found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MechanicsPage
