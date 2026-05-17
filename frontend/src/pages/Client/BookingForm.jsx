import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const BookingForm = () => {
  const { mechanicId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [autoSubmitAttempted, setAutoSubmitAttempted] = useState(false)
  const [mechanic, setMechanic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [vehicleImage, setVehicleImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formData, setFormData] = useState({
    service: '',
    vehicle: {
      make: '',
      model: '',
      year: new Date().getFullYear()
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
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchMechanic()
  }, [mechanicId])

  useEffect(() => {
    if (location.state?.autoSubmit && user && !autoSubmitAttempted) {
      const pendingDataStr = localStorage.getItem('pendingBooking')
      if (pendingDataStr) {
        try {
          const { requestBody, vehicleImage: savedImage } = JSON.parse(pendingDataStr)
          
          if (savedImage && requestBody.images && requestBody.images[0]) {
            requestBody.images[0].uploadedBy = user.id
          }
          
          if (savedImage) {
            setVehicleImage(savedImage)
          }
          
          submitBooking(requestBody)
        } catch (e) {
          console.error('Error parsing pending booking:', e)
        }
      }
      setAutoSubmitAttempted(true)
    }
  }, [location.state, user, autoSubmitAttempted])

  const fetchMechanic = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/mechanics/${mechanicId}`)
      const data = await response.json()
      if (response.ok) {
        setMechanic(data.mechanic)
        if (data.mechanic.specialization && data.mechanic.specialization.length > 0) {
          setFormData(prev => ({
            ...prev,
            service: data.mechanic.specialization[0],
            pricing: {
              estimatedCost: data.mechanic.pricing?.diagnosticFee || 0
            }
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching mechanic:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleVehicleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [name]: value
      }
    }))
  }

  const handleLocationChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }))
  }

  const handleServiceChange = (e) => {
    const specialization = e.target.value
    setFormData(prev => ({
      ...prev,
      service: specialization,
      pricing: {
        estimatedCost: mechanic.pricing?.diagnosticFee || 0
      }
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, vehicleImage: 'Image size must be less than 5MB' }))
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, vehicleImage: 'Only image files are allowed' }))
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setVehicleImage(reader.result)
        setImagePreview(reader.result)
        setErrors(prev => ({ ...prev, vehicleImage: '' }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setVehicleImage(null)
    setImagePreview(null)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.service) newErrors.service = 'Service is required'
    if (!formData.vehicle.make) newErrors['vehicle.make'] = 'Vehicle make is required'
    if (!formData.vehicle.model) newErrors['vehicle.model'] = 'Vehicle model is required'
    if (!formData.vehicle.year || formData.vehicle.year < 1900 || formData.vehicle.year > new Date().getFullYear() + 1) {
      newErrors['vehicle.year'] = 'Invalid vehicle year'
    }
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Date is required'
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Time is required'
    if (!formData.description) newErrors.description = 'Problem description is required'
    if (formData.location.type === 'mobile' && !formData.location.address) {
      newErrors['location.address'] = 'Address is required for mobile service'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitBooking = async (requestBody) => {
    setSubmitting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.removeItem('pendingBooking')
        localStorage.removeItem('pendingBookingMechanic')
        window.dispatchEvent(new CustomEvent('show-rating-popup'))
        navigate(`/client/bookings/${data.booking._id}`)
      } else {
        setErrors({ general: data.message || 'Failed to create booking' })
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      setErrors({ general: 'An error occurred while creating the booking' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const requestBody = {
      mechanic: mechanicId,
      service: formData.service,
      vehicle: formData.vehicle,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      estimatedDuration: formData.estimatedDuration,
      location: formData.location,
      description: formData.description,
      pricing: formData.pricing
    }

    // Add vehicle image if provided
    if (vehicleImage) {
      requestBody.images = [{
        url: vehicleImage,
        description: 'Vehicle image',
        uploadedBy: user?.id || null
      }]
    }

    if (!user) {
      localStorage.setItem('pendingBooking', JSON.stringify({ requestBody, vehicleImage }))
      localStorage.setItem('pendingBookingMechanic', mechanicId)
      navigate('/create-account', { state: { fromBooking: true } })
      return
    }

    await submitBooking(requestBody)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!mechanic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mechanic Not Found</h2>
          <button
            onClick={() => navigate('/mechanics')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Mechanics
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book a Service</h1>
          <p className="mt-2 text-gray-600">
            Booking with: <span className="font-semibold">{mechanic.businessName}</span>
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            {errors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service *
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleServiceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mechanic.specialization && mechanic.specialization.length > 0 ? (
                    mechanic.specialization.map((spec, index) => (
                      <option key={index} value={spec}>
                        {spec}
                      </option>
                    ))
                  ) : (
                    <option value="">No services available</option>
                  )}
                </select>
                {errors.service && (
                  <p className="mt-1 text-sm text-red-600">{errors.service}</p>
                )}
              </div>

              {/* Vehicle Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Make *
                    </label>
                    <input
                      type="text"
                      name="make"
                      value={formData.vehicle.make}
                      onChange={handleVehicleChange}
                      placeholder="e.g., Toyota"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors['vehicle.make'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['vehicle.make']}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.vehicle.model}
                      onChange={handleVehicleChange}
                      placeholder="e.g., Camry"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors['vehicle.model'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['vehicle.model']}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.vehicle.year}
                      onChange={handleVehicleChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors['vehicle.year'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['vehicle.year']}</p>
                    )}
                  </div>
                </div>

                {/* Vehicle Image Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Image (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    {imagePreview ? (
                      <div className="relative w-full">
                        <img
                          src={imagePreview}
                          alt="Vehicle preview"
                          className="w-full h-64 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {errors.vehicleImage && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehicleImage}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Adding a vehicle image helps the mechanic better understand the issue.</p>
                </div>
              </div>

              {/* Date and Time */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.scheduledDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.scheduledTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Location */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Service Location</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="shop"
                          checked={formData.location.type === 'shop'}
                          onChange={handleLocationChange}
                          className="mr-2"
                        />
                        Shop Visit
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="type"
                          value="mobile"
                          checked={formData.location.type === 'mobile'}
                          onChange={handleLocationChange}
                          className="mr-2"
                        />
                        Mobile Service
                      </label>
                    </div>
                  </div>
                  {formData.location.type === 'mobile' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.location.address}
                        onChange={handleLocationChange}
                        placeholder="Enter your address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors['location.address'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['location.address']}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Problem Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Problem Description</h3>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the issue with your vehicle..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Diagnostic Cost */}
              <div className="border-t pt-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Diagnostic Cost:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${formData.pricing.estimatedCost}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
