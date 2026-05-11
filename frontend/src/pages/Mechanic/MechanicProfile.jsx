import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { mechanicsAPI, authAPI } from '../../services/api'
import { Wrench, Edit2, Save, X, MapPin, Phone, Mail, DollarSign, Clock, User, Star, AlertTriangle } from 'lucide-react'

const MechanicProfile = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
    businessName: '',
    specialization: [],
    experience: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        lat: '',
        lng: ''
      }
    },
    serviceRadius: '',
    pricing: {
      hourlyRate: '',
      diagnosticFee: ''
    },
    emergencyAvailable: false
  })

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
    'General Maintenance',
    'Body Work',
    'Exhaust System'
  ]

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await mechanicsAPI.getById(user.id)
      setProfile(response.data.mechanic)
      if (response.data.mechanic) {
        const profileImage = response.data.mechanic.profileImage || user.profileImage || ''
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          profileImage: profileImage,
          businessName: response.data.mechanic.businessName || '',
          specialization: response.data.mechanic.specialization || [],
          experience: response.data.mechanic.experience || '',
          location: {
            address: response.data.mechanic.location?.address || '',
            city: response.data.mechanic.location?.city || '',
            state: response.data.mechanic.location?.state || '',
            zipCode: response.data.mechanic.location?.zipCode || '',
            coordinates: {
              lat: response.data.mechanic.location?.coordinates?.lat || '',
              lng: response.data.mechanic.location?.coordinates?.lng || ''
            }
          },
          serviceRadius: response.data.mechanic.serviceRadius || '',
          pricing: {
            hourlyRate: response.data.mechanic.pricing?.hourlyRate || '',
            diagnosticFee: response.data.mechanic.pricing?.diagnosticFee || ''
          },
          emergencyAvailable: user.emergencyAvailable || false
        })
        setPreviewImage(profileImage)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Use user data if API fails
      const profileImage = user.profileImage || ''
      setProfile(user)
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: profileImage,
        businessName: user.businessName || '',
        specialization: user.specialization || [],
        experience: user.experience || '',
        location: user.location || {
          address: '',
          city: '',
          state: '',
          zipCode: '',
          coordinates: { lat: '', lng: '' }
        },
        serviceRadius: user.serviceRadius || '',
        pricing: user.pricing || { hourlyRate: '', diagnosticFee: '' }
      })
      setPreviewImage(profileImage)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setFormData(prev => ({ ...prev, profileImage: base64String }))
        setPreviewImage(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

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

  const handleSpecializationChange = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        setMessage({ type: 'error', text: 'Please fill in all required personal fields' })
        setSaving(false)
        return
      }

      if (!formData.businessName) {
        setMessage({ type: 'error', text: 'Business name is required' })
        setSaving(false)
        return
      }

      // Separate user fields from mechanic fields
      const { firstName, lastName, email, phone, profileImage, emergencyAvailable, ...mechanicData } = formData
      
      // Update user profile with personal fields (email is read-only)
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        profileImage,
        emergencyAvailable
      })
      
      // Update mechanic profile with business fields
      if (profile) {
        await mechanicsAPI.update(profile._id, mechanicData)
      } else {
        await mechanicsAPI.create(mechanicData)
      }
      
      await fetchProfile()
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || 'Failed to update profile. Please try again.' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      const profileImage = profile.profileImage || user.profileImage || ''
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: profileImage,
        businessName: profile.businessName || '',
        specialization: profile.specialization || [],
        experience: profile.experience || '',
        location: {
          address: profile.location?.address || '',
          city: profile.location?.city || '',
          state: profile.location?.state || '',
          zipCode: profile.location?.zipCode || '',
          coordinates: {
            lat: profile.location?.coordinates?.lat || '',
            lng: profile.location?.coordinates?.lng || ''
          }
        },
        serviceRadius: profile.serviceRadius || '',
        pricing: {
          hourlyRate: profile.pricing?.hourlyRate || '',
          diagnosticFee: profile.pricing?.diagnosticFee || ''
        },
        emergencyAvailable: user.emergencyAvailable || false
      })
      setPreviewImage(profileImage)
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">Mechanic Profile</h1>
          <p className="text-gray-600 mt-2">Manage your business information and services</p>
        </div>

        {!profile ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                <Wrench className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Mechanic Profile
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Set up your business profile to start receiving service requests from clients.
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Create Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">Business Information</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {message.text && (
              <div className={`px-6 py-4 mx-6 mt-6 rounded-xl flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.type === 'success' ? <Save className="h-5 w-5 mr-2" /> : <AlertTriangle className="h-5 w-5 mr-2" />}
                {message.text}
              </div>
            )}

            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          value={formData.email}
                          onChange={handleChange}
                          disabled
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profile Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      />
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Profile Preview"
                          className="h-16 w-16 rounded-full object-cover shadow-md border-2 border-gray-200"
                        />
                      )}
                    </div>
                  </div>

                  {/* Business Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Business Information</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          value={formData.businessName}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Specializations */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Specializations
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {specializations.map(spec => (
                            <label key={spec} className="flex items-center px-3 py-2 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-gray-200">
                              <input
                                type="checkbox"
                                checked={formData.specialization.includes(spec)}
                                onChange={() => handleSpecializationChange(spec)}
                                className="mr-2 accent-blue-600"
                              />
                              <span className="text-sm font-medium">{spec}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          name="experience"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          value={formData.experience}
                          onChange={handleChange}
                          min="0"
                          max="50"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="location.address"
                        placeholder="Street Address"
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        value={formData.location.address}
                        onChange={handleChange}
                        required
                      />
                      <input
                        type="text"
                        name="location.city"
                        placeholder="City"
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        value={formData.location.city}
                        onChange={handleChange}
                        required
                      />
                      <input
                        type="text"
                        name="location.state"
                        placeholder="State"
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        value={formData.location.state}
                        onChange={handleChange}
                        required
                      />
                      <input
                        type="text"
                        name="location.zipCode"
                        placeholder="ZIP Code"
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        value={formData.location.zipCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Service Radius */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service Radius (miles)
                    </label>
                    <input
                      type="number"
                      name="serviceRadius"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      value={formData.serviceRadius}
                      onChange={handleChange}
                      min="1"
                      max="100"
                    />
                  </div>

                  {/* Pricing */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          name="pricing.hourlyRate"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          value={formData.pricing.hourlyRate}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Diagnostic Fee ($)
                        </label>
                        <input
                          type="number"
                          name="pricing.diagnosticFee"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          value={formData.pricing.diagnosticFee}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Availability Toggle */}
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                          <label className="text-sm font-bold text-red-900">
                            Available for Emergency Services
                          </label>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                          Enable to receive emergency booking requests with higher priority and emergency fees
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="emergencyAvailable"
                          checked={formData.emergencyAvailable}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center space-x-6">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-lg border-2 border-gray-100">
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt="Profile"
                          className="h-24 w-24 rounded-2xl object-cover"
                        />
                      ) : (
                        <Wrench className="h-12 w-12 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                        {profile.businessName}
                      </h3>
                      <p className="text-gray-600 font-medium">Mechanic Account</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Business Name
                      </label>
                      <div className="flex items-center text-gray-900 font-medium">
                        <Wrench className="h-4 w-4 mr-2 text-blue-600" />
                        {profile.businessName}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Experience
                      </label>
                      <div className="flex items-center text-gray-900 font-medium">
                        <Clock className="h-4 w-4 mr-2 text-green-600" />
                        {profile.experience} years
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center text-gray-900 font-medium">
                        <Mail className="h-4 w-4 mr-2 text-purple-600" />
                        {profile.email}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center text-gray-900 font-medium">
                        <Phone className="h-4 w-4 mr-2 text-orange-600" />
                        {profile.phone}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Specializations
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialization.map((spec, index) => (
                        <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold shadow-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="flex items-start text-gray-900">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">{profile.location.address}</p>
                        <p className="text-gray-600">
                          {profile.location.city}, {profile.location.state} {profile.location.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-8">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Account Type
                        </label>
                        <p className="text-gray-900 font-medium">Mechanic</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Member Since
                        </label>
                        <p className="text-gray-900 font-medium">
                          {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Average Rating
                        </label>
                        <p className="text-gray-900 font-medium flex items-center">
                          {profile.rating?.average?.toFixed(1) || '0.0'} <Star className="h-4 w-4 ml-1 text-yellow-500 fill-current" /> ({profile.rating?.count || 0} reviews)
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Service Radius
                        </label>
                        <p className="text-gray-900 font-medium">{profile.serviceRadius} miles</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Hourly Rate
                        </label>
                        <p className="text-gray-900 font-medium">${profile.pricing?.hourlyRate}/hour</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Diagnostic Fee
                        </label>
                        <p className="text-gray-900 font-medium">${profile.pricing?.diagnosticFee}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MechanicProfile
