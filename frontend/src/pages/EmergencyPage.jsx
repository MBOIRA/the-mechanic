import { useState } from 'react'
import { emergencyAPI } from '../services/api'
import { 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  Shield,
  Car,
  Wrench,
  Send
} from 'lucide-react'

const EmergencyPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: {
      address: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    issue: '',
    vehicleType: 'car',
    urgency: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [requestId, setRequestId] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await emergencyAPI.submitRequest(formData)
      setRequestId(response.data.requestId)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting emergency request:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-6">
              <Shield className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Emergency Request Submitted
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Your emergency request has been received and is being processed.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Request ID:</p>
              <p className="text-2xl font-mono font-bold text-primary-600 mb-4">
                {requestId}
              </p>
              <p className="text-sm text-gray-600">
                Estimated response time: 15-30 minutes
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Phone className="h-5 w-5 text-error-600" />
                <span className="text-lg font-medium">Emergency: 911</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Phone className="h-5 w-5 text-primary-600" />
                <span className="text-lg font-medium">Roadside Assistance: 1-800-HELP-NOW</span>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary mt-8"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-error-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-error-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Emergency Roadside Assistance
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get immediate help for vehicle emergencies. Our network of mechanics is available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Request Emergency Help
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="input"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    id="address"
                    name="location.address"
                    placeholder="Enter your current address or location"
                    required
                    className="input"
                    value={formData.location.address}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="btn-secondary text-sm"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Use Current Location
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  className="input"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  <option value="car">Car</option>
                  <option value="truck">Truck</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  className="input"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  <option value="low">Low - Not stranded</option>
                  <option value="medium">Medium - Minor issue</option>
                  <option value="high">High - Stranded but safe</option>
                  <option value="critical">Critical - Dangerous situation</option>
                </select>
              </div>

              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the Issue
                </label>
                <textarea
                  id="issue"
                  name="issue"
                  rows={4}
                  required
                  className="input"
                  placeholder="Please describe what happened and what help you need..."
                  value={formData.issue}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-error py-3 text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </div>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Emergency Request
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Emergency Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Immediate Actions
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Stay Safe</p>
                    <p className="text-sm text-gray-600">Move to a safe location if possible and turn on hazard lights.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Call 911 if needed</p>
                    <p className="text-sm text-gray-600">For medical emergencies or dangerous situations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Car className="h-5 w-5 text-error-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Vehicle Safety</p>
                    <p className="text-sm text-gray-600">Turn off engine, engage parking brake, and stay clear of traffic.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Emergency Services</p>
                    <p className="text-sm text-gray-600">Police, Fire, Medical</p>
                  </div>
                  <a href="tel:911" className="btn-error text-sm">
                    <Phone className="h-4 w-4 mr-1" />
                    911
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Roadside Assistance</p>
                    <p className="text-sm text-gray-600">24/7 Support</p>
                  </div>
                  <a href="tel:1-800-HELP-NOW" className="btn-primary text-sm">
                    <Phone className="h-4 w-4 mr-1" />
                    1-800-HELP-NOW
                  </a>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Response Times
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical Emergency</span>
                  <span className="text-sm font-medium text-error-600">5-15 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">High Priority</span>
                  <span className="text-sm font-medium text-warning-600">15-30 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Standard Request</span>
                  <span className="text-sm font-medium text-primary-600">30-60 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyPage
