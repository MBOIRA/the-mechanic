import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  CheckCircle, 
  ArrowLeft, 
  User, 
  Wrench, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Clock,
  Building2,
  FileText
} from 'lucide-react'

const AccountVerification = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get form data from localStorage (stored by CreateAccountPage)
    const savedData = localStorage.getItem('pendingAccountData')
    if (savedData) {
      setFormData(JSON.parse(savedData))
    } else {
      // If no data, redirect back to create account
      navigate('/create-account')
    }
  }, [navigate])

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Form data being sent:', formData)
      
      // Register the user with the verified data
      const result = await register(formData)
      console.log('Registration result:', result)
      
      // Clear the pending data
      localStorage.removeItem('pendingAccountData')
      
      // Navigate to appropriate dashboard
      if (formData.role === 'mechanic') {
        navigate('/mechanic/dashboard')
        } else {
          const pendingEmergency = localStorage.getItem('pendingEmergencyBooking')
          const pendingInquiry = localStorage.getItem('pendingInquiry')
          const pendingBookingData = localStorage.getItem('pendingBooking')
          const pendingBookingMechanic = localStorage.getItem('pendingBookingMechanic')
          
          if (pendingEmergency) {
            navigate('/client/emergency', { state: { autoSubmit: true } })
          } else if (pendingBookingData && pendingBookingMechanic) {
            navigate(`/book/${pendingBookingMechanic}`, { state: { autoSubmit: true } })
          } else if (pendingInquiry) {
          // Auto-submit the pending inquiry
          try {
            const inquiryData = JSON.parse(pendingInquiry)
            // Include userId in the inquiry
            inquiryData.userId = result.user.id
            // Update name/email from user data if they were filled in the form
            if (!inquiryData.name && result.user.firstName && result.user.lastName) {
              inquiryData.name = `${result.user.firstName} ${result.user.lastName}`
            }
            if (!inquiryData.email) {
              inquiryData.email = result.user.email
            }
            if (!inquiryData.phone) {
              inquiryData.phone = result.user.phone
            }
            
            // Submit the inquiry
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${result.token}`
              },
              body: JSON.stringify(inquiryData)
            })
            
            // Clear the pending inquiry
            localStorage.removeItem('pendingInquiry')
            
            // Navigate to inquiries page with success message
            navigate('/inquiries', { state: { inquirySubmitted: true } })
          } catch (error) {
            console.error('Error submitting pending inquiry:', error)
            navigate('/inquiries')
          }
        } else {
          navigate('/client/dashboard')
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      console.error('Error details:', JSON.stringify(err, null, 2))
      setError(err.message || 'Failed to create account. Please try again.')
      setLoading(false)
    }
  }

  const handleEdit = () => {
    // Go back to create account page with the current data
    navigate('/create-account')
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Account Details</h1>
          <p className="mt-2 text-gray-600">Please review your information before creating your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Verification Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Personal Information */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">First Name</p>
                <p className="text-base font-medium text-gray-900">{formData.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Name</p>
                <p className="text-base font-medium text-gray-900">{formData.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="text-base font-medium text-gray-900">{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="text-base font-medium text-gray-900">{formData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="text-base font-medium text-gray-900 capitalize">
                  {formData.role === 'mechanic' ? (
                    <span className="flex items-center">
                      <Wrench className="h-4 w-4 mr-1 text-primary-600" />
                      Mechanic
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-primary-600" />
                      Client
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Mechanic Specific Information */}
          {formData.role === 'mechanic' && (
            <>
              {/* Business Information */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Building2 className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Business Name</p>
                    <p className="text-base font-medium text-gray-900">{formData.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Years of Experience</p>
                    <p className="text-base font-medium text-gray-900">{formData.experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Radius</p>
                    <p className="text-base font-medium text-gray-900">{formData.serviceRadius || 'Not specified'} miles</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Business Bio</p>
                    <p className="text-base font-medium text-gray-900">
                      {formData.bio || 'No bio provided'}
                    </p>
                  </div>
                </div>

                {/* Specializations */}
                {formData.specialization && formData.specialization.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.specialization.map((spec, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Business Location */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Business Location</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Street Address</p>
                    <p className="text-base font-medium text-gray-900">{formData.location?.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="text-base font-medium text-gray-900">{formData.location?.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="text-base font-medium text-gray-900">{formData.location?.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ZIP Code</p>
                    <p className="text-base font-medium text-gray-900">{formData.location?.zipCode || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-5 w-5 text-primary-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Pricing Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="text-base font-medium text-gray-900">${formData.pricing?.hourlyRate}/hour</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Diagnostic Fee</p>
                    <p className="text-base font-medium text-gray-900">
                      ${formData.pricing?.diagnosticFee || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {formData.certifications && formData.certifications.length > 0 && (
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <Award className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((cert, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {formData.availability && (
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 text-primary-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(formData.availability).map(([day, available]) => (
                      <div key={day} className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {available ? '✓' : '✗'} {day.charAt(0).toUpperCase() + day.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleEdit}
                disabled={loading}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Edit Information
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirm & Create Account
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>By confirming, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}

export default AccountVerification
