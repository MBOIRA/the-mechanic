import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Car, 
  Clock,
  ArrowLeft,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react'

const EmergencyBooking = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [autoSubmitAttempted, setAutoSubmitAttempted] = useState(false)
  const [mechanics, setMechanics] = useState([])
  const [formData, setFormData] = useState({
    mechanic: '',
    mechanicSelectionType: 'auto',
    service: '',
    vehicle: {
      make: '',
      model: '',
      year: new Date().getFullYear()
    },
    description: '',
    location: {
      type: 'mobile',
      address: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    emergencyType: 'other',
    otherEmergencyDescription: '',
    estimatedCost: 0,
    estimatedDuration: 15,
    images: []
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [assignedMechanic, setAssignedMechanic] = useState(null)
  const [imagePreviews, setImagePreviews] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    fetchMechanics()
    getUserLocation()
    
    // Restore form data if returning from manual selection
    if (location.state?.formData) {
      setFormData(location.state.formData)
    }
    
    // Auto-submit logic
    if (location.state?.autoSubmit && isAuthenticated && !autoSubmitAttempted) {
      const pendingData = localStorage.getItem('pendingEmergencyBooking')
      if (pendingData) {
        const parsedData = JSON.parse(pendingData)
        setFormData(parsedData)
        localStorage.removeItem('pendingEmergencyBooking')
        setAutoSubmitAttempted(true)
        submitBooking(parsedData)
      }
    }
  }, [location.state, isAuthenticated, autoSubmitAttempted])

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLocationLoading(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Update coordinates in form
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              lat: latitude,
              lng: longitude
            }
          }
        }))

        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          
          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: data.display_name
              }
            }))
          }
        } catch (error) {
          console.error('Error getting address from coordinates:', error)
        }

        setLocationLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationError('Unable to retrieve your location. Please enter it manually.')
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const fetchMechanics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mechanics`)
      const data = await response.json()
      if (response.ok) {
        // Get all mechanics, not just emergency ones
        setMechanics(data.mechanics)
      }
    } catch (error) {
      console.error('Error fetching mechanics:', error)
    } finally {
      setLoading(false)
    }
  }

  const emergencyTypes = [
    { value: 'towing', label: 'Towing Needed' },
    { value: 'dead_battery', label: 'Dead Battery' },
    { value: 'flat_tire', label: 'Flat Tire' },
    { value: 'engine_failure', label: 'Engine Failure' },
    { value: 'accident', label: 'Accident' },
    { value: 'other', label: 'Other Emergency' }
  ]

  const services = [
    'General Repair',
    'Engine Diagnostic',
    'Brake Service',
    'Transmission',
    'Electrical',
    'Towing',
    'Battery Service',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64String]
        }))
        setImagePreviews(prev => [...prev, base64String])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const submitBooking = async (dataToSubmit) => {
    setLoading(true)
    setError('')

    try {
      // Validate manual selection
      if (dataToSubmit.mechanicSelectionType === 'manual' && !dataToSubmit.mechanic) {
        setError('Please select a mechanic or switch to auto-assign')
        setLoading(false)
        return
      }

      const token = localStorage.getItem('token')

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSubmit)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create emergency booking')
      }

      setAssignedMechanic(data.mechanic)
      setSuccess(true)
      setTimeout(() => {
        navigate('/client/bookings')
      }, 5000)
    } catch (error) {
      console.error('Error creating emergency booking:', error)
      setError(error.message || 'Failed to create emergency booking')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      localStorage.setItem('pendingEmergencyBooking', JSON.stringify(formData))
      navigate('/create-account', { state: { fromEmergency: true } })
      return
    }

    await submitBooking(formData)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Request Sent!</h2>
            <p className="text-gray-600 mb-6">
              Your emergency request has been sent and will be handled immediately.
            </p>
            
            {assignedMechanic && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Assigned Mechanic Contact
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{assignedMechanic.name}</span>
                  </div>
                  {assignedMechanic.businessName && (
                    <div>
                      <span className="font-medium text-gray-700">Business:</span>
                      <span className="ml-2 text-gray-900">{assignedMechanic.businessName}</span>
                    </div>
                  )}
                  {assignedMechanic.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <a href={`tel:${assignedMechanic.phone}`} className="ml-2 text-green-600 font-semibold hover:underline">
                        {assignedMechanic.phone}
                      </a>
                    </div>
                  )}
                  {assignedMechanic.location?.city && (
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-900">{assignedMechanic.location.city}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-500">Redirecting to your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(isAuthenticated ? '/client/dashboard' : '/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
          </button>
          <div className="flex items-center">
            <AlertTriangle className="h-10 w-10 text-red-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Emergency Service Request</h1>
              <p className="text-gray-600 mt-1">Get immediate help for your vehicle emergency</p>
            </div>
          </div>
        </div>

        {mechanics.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">No mechanics available for emergencies</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Currently, there are no mechanics who are available for emergency services. Please try again later or contact a mechanic directly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
            Road Emergency Safety Steps
          </h2>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
              <div>
                <p className="font-medium">Move to a Safe Place</p>
                <p className="text-blue-700">Pull over to the shoulder or a safe area away from traffic. Stay in your vehicle if it's unsafe outside.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
              <div>
                <p className="font-medium">Stop the Engine</p>
                <p className="text-blue-700">Turn off the ignition to prevent fire hazards and further damage to the vehicle.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
              <div>
                <p className="font-medium">Turn on Hazard Lights</p>
                <p className="text-blue-700">Activate hazard lights to alert other drivers of your stopped vehicle.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</div>
              <div>
                <p className="font-medium">Set Up Warning Triangles</p>
                <p className="text-blue-700">Place emergency triangles behind your vehicle to warn approaching traffic.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</div>
              <div>
                <p className="font-medium">Call for Help</p>
                <p className="text-blue-700">Call 911 for serious accidents. Use our emergency service to get immediate mechanic assistance.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">6</div>
              <div>
                <p className="font-medium">Stay in Vehicle</p>
                <p className="text-blue-700">Remain inside with seatbelt on until help arrives, unless it's unsafe to do so.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emergency Type */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Emergency Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {emergencyTypes.map(type => (
                <label
                  key={type.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.emergencyType === type.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="emergencyType"
                    value={type.value}
                    checked={formData.emergencyType === type.value}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
            {formData.emergencyType === 'other' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe your emergency</label>
                <input
                  type="text"
                  name="otherEmergencyDescription"
                  value={formData.otherEmergencyDescription}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Overheating, Stalled in traffic, Electrical failure..."
                />
              </div>
            )}
          </div>

          {/* Mechanic Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mechanic Selection</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Selection Method
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors flex-1">
                  <input
                    type="radio"
                    name="mechanicSelectionType"
                    value="auto"
                    checked={formData.mechanicSelectionType === 'auto'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Auto-Assign</p>
                    <p className="text-sm text-gray-600">System automatically finds nearest available mechanic</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors flex-1">
                  <input
                    type="radio"
                    name="mechanicSelectionType"
                    value="manual"
                    checked={formData.mechanicSelectionType === 'manual'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Manual Selection</p>
                    <p className="text-sm text-gray-600">Choose from mechanics ranked by distance</p>
                  </div>
                </label>
              </div>
            </div>

            {formData.mechanicSelectionType === 'auto' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  The system will automatically assign the nearest available mechanic based on your location.
                  If no emergency-available mechanics are in your area, nearby mechanics will be notified.
                </p>
              </div>
            )}

            {formData.mechanicSelectionType === 'manual' && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 mb-1">Select Mechanic</p>
                      {formData.mechanic ? (
                        <p className="text-green-800">
                          {mechanics.find(m => m._id === formData.mechanic)?.firstName} {mechanics.find(m => m._id === formData.mechanic)?.lastName}
                          {mechanics.find(m => m._id === formData.mechanic)?.businessName && ` - ${mechanics.find(m => m._id === formData.mechanic)?.businessName}`}
                        </p>
                      ) : (
                        <p className="text-green-700 text-sm">No mechanic selected</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(isAuthenticated ? '/client/emergency-mechanics' : '/emergency-mechanics', { state: { formData } })}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      {formData.mechanic ? 'Change' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Car className="h-5 w-5 text-gray-600 mr-2" />
              Vehicle Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                <input
                  type="text"
                  name="vehicle.make"
                  value={formData.vehicle.make}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Toyota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  name="vehicle.model"
                  value={formData.vehicle.model}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Camry"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  name="vehicle.year"
                  value={formData.vehicle.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-gray-600 mr-2" />
              Your Location
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <div className="relative">
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  required
                  disabled={locationLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder={locationLoading ? 'Detecting your location...' : 'Enter your current location'}
                />
                {locationLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  </div>
                )}
              </div>
              {locationError && (
                <p className="text-sm text-red-600 mt-2">{locationError}</p>
              )}
              {!locationLoading && !locationError && formData.location.coordinates.lat && formData.location.coordinates.lng && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Location detected automatically
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Emergency service is mobile only - the mechanic will come to your location
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos (Optional)</h2>
            <div className="space-y-4">
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer"
                  >
                    <Car className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload photos of your vehicle or the problem
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB each
                    </p>
                  </label>
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Fee Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Emergency Fee</h3>
                <p className="text-sm text-red-700 mt-1">
                  An additional emergency fee of $50 will be added to your service cost for immediate response.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || mechanics.length === 0}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending Emergency Request...
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 mr-2" />
                Send Emergency Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EmergencyBooking
