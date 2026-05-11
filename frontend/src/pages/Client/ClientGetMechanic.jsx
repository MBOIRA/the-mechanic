import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mechanicsAPI, servicesAPI, bookingsAPI } from '../../services/api'
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Clock, 
  Filter,
  Wrench,
  DollarSign,
  Calendar,
  Car
} from 'lucide-react'

const ClientGetMechanic = () => {
  const navigate = useNavigate()
  const [mechanics, setMechanics] = useState([])
  const [services, setServices] = useState([])
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedMechanic, setSelectedMechanic] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [sortOrder, setSortOrder] = useState('desc')

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

  const [showBookingForm, setShowBookingForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const [bookingData, setBookingData] = useState({
    mechanic: '',
    service: '',
    vehicle: {
      make: '',
      model: '',
      year: '',
      vin: ''
    },
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 60,
    location: {
      type: 'shop',
      address: ''
    },
    description: '',
    pricing: {
      estimatedCost: 0
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [mechanicsResponse, servicesResponse] = await Promise.all([
        mechanicsAPI.getAll(),
        servicesAPI.getAll()
      ])
      
      setMechanics(mechanicsResponse.data.mechanics)
      setServices(servicesResponse.data.services)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMechanicSelect = (mechanic) => {
    setSelectedMechanic(mechanic)
    setBookingData(prev => ({
      ...prev,
      mechanic: mechanic._id,
      pricing: {
        estimatedCost: mechanic.pricing?.hourlyRate || 100
      }
    }))
    setShowBookingForm(true)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    try {
      await bookingsAPI.create(bookingData)
      alert('Booking created successfully!')
      setShowBookingForm(false)
      setSelectedMechanic(null)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Error creating booking. Please try again.')
    }
  }

  const filteredMechanics = mechanics.filter(mechanic => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' || 
      mechanic.businessName?.toLowerCase().includes(searchLower) ||
      mechanic.user?.firstName?.toLowerCase().includes(searchLower) ||
      mechanic.user?.lastName?.toLowerCase().includes(searchLower) ||
      mechanic.location?.city?.toLowerCase().includes(searchLower)
    
    const matchesService = selectedSpecialization === '' || 
      mechanic.specialization?.includes(selectedSpecialization)
    
    return matchesSearch && matchesService
  })

  const sortedMechanics = [...filteredMechanics].sort((a, b) => {
    let valueA, valueB
    
    switch (sortBy) {
      case 'rating':
        valueA = a.rating?.average || 0
        valueB = b.rating?.average || 0
        break
      case 'price':
        valueA = a.pricing?.hourlyRate || 0
        valueB = b.pricing?.hourlyRate || 0
        break
      case 'experience':
        valueA = a.experience || 0
        valueB = b.experience || 0
        break
      case 'reviews':
        valueA = a.rating?.count || 0
        valueB = b.rating?.count || 0
        break
      default:
        return 0
    }
    
    if (sortOrder === 'asc') {
      return valueA - valueB
    } else {
      return valueB - valueA
    }
  })

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find a Mechanic
          </h1>
          <p className="text-gray-600">
            Choose from our network of verified mechanics for your vehicle service needs.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by business name, location..."
                  className="input !pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="input !pl-10"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="input !pl-10"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Sort by Rating</option>
                <option value="price">Sort by Price</option>
                <option value="experience">Sort by Experience</option>
                <option value="reviews">Sort by Reviews</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            {selectedSpecialization && (
              <>
                <span className="text-sm text-gray-500">Filtered by:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {selectedSpecialization}
                  <button
                    onClick={() => setSelectedSpecialization('')}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              </>
            )}
            <span className="text-sm text-gray-500">
              ({sortedMechanics.length} mechanic{sortedMechanics.length !== 1 ? 's' : ''} found)
            </span>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        {/* Mechanics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {mechanic.rating?.average?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-content">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {mechanic.location.city}, {mechanic.location.state}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Wrench className="h-4 w-4 mr-2" />
                    {mechanic.experience} years experience
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${mechanic.pricing?.hourlyRate || 0}/hour
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {mechanic.specialization.slice(0, 2).map((spec, index) => (
                      <span key={index} className="badge-info text-xs">
                        {spec}
                      </span>
                    ))}
                    {mechanic.specialization.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{mechanic.specialization.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button
                  onClick={() => navigate(`/client/book/${mechanic._id}`)}
                  className="btn-primary w-full"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedMechanic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Book with {selectedMechanic.businessName}
                  </h2>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <select
                      className="input"
                      value={bookingData.service}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        service: e.target.value
                      }))}
                      required
                    >
                      <option value="">Select a service</option>
                      {services.map(service => (
                        <option key={service._id} value={service._id}>
                          {service.name} - ${service.basePrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Make
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={bookingData.vehicle.make}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            vehicle: {
                              ...prev.vehicle,
                              make: e.target.value
                            }
                          }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={bookingData.vehicle.model}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            vehicle: {
                              ...prev.vehicle,
                              model: e.target.value
                            }
                          }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={bookingData.vehicle.year}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            vehicle: {
                              ...prev.vehicle,
                              year: e.target.value
                            }
                          }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          VIN (Optional)
                        </label>
                        <input
                          type="text"
                          className="input"
                          value={bookingData.vehicle.vin}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            vehicle: {
                              ...prev.vehicle,
                              vin: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scheduling */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Service</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={bookingData.scheduledDate}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            scheduledDate: e.target.value
                          }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          className="input"
                          value={bookingData.scheduledTime}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            scheduledTime: e.target.value
                          }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Location */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Service Location</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Type
                        </label>
                        <select
                          className="input"
                          value={bookingData.location.type}
                          onChange={(e) => setBookingData(prev => ({
                            ...prev,
                            location: {
                              ...prev.location,
                              type: e.target.value
                            }
                          }))}
                        >
                          <option value="shop">Shop Service</option>
                          <option value="mobile">Mobile Service</option>
                        </select>
                      </div>
                      
                      {bookingData.location.type === 'mobile' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service Address
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={bookingData.location.address}
                            onChange={(e) => setBookingData(prev => ({
                              ...prev,
                              location: {
                                ...prev.location,
                                address: e.target.value
                              }
                            }))}
                            placeholder="Enter your address for mobile service"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the Issue
                    </label>
                    <textarea
                      className="input"
                      rows={4}
                      value={bookingData.description}
                      onChange={(e) => setBookingData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      placeholder="Please describe what service you need..."
                      required
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                    >
                      Book Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientGetMechanic
