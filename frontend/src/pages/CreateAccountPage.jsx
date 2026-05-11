import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Wrench, User, Check, X } from 'lucide-react'

const RequirementCheck = ({ met, text }) => (
  <div className="flex items-center text-xs">
    {met ? (
      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
    ) : (
      <X className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
    )}
    <span className={met ? 'text-gray-700' : 'text-gray-500'}>{text}</span>
  </div>
)

const CreateAccountPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    // Mechanic specific fields
    businessName: '',
    specialization: [],
    experience: '',
    bio: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    serviceRadius: '',
    pricing: {
      hourlyRate: '',
      diagnosticFee: ''
    },
    certifications: [],
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    services: []
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(location.state?.isLogin || false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin)
    }
  }, [location.state])
  
  const { login, register, loading } = useAuth()
  const navigate = useNavigate()

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

  const certifications = [
    'ASE Certified',
    'Master Technician',
    'Engine Repair',
    'Transmission Specialist',
    'Brake Specialist',
    'Electrical Systems',
    'AC & Heating',
    'State Inspection License',
    'Emissions Certification',
    'Hybrid/Electric Vehicle'
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else if (type === 'checkbox') {
      if (name === 'specialization') {
        setFormData(prev => ({
          ...prev,
          specialization: checked 
            ? [...prev.specialization, value]
            : prev.specialization.filter(spec => spec !== value)
        }))
      } else if (name === 'certifications') {
        setFormData(prev => ({
          ...prev,
          certifications: checked 
            ? [...prev.certifications, value]
            : prev.certifications.filter(cert => cert !== value)
        }))
      } else if (name.startsWith('availability.')) {
        const day = name.split('.')[1]
        setFormData(prev => ({
          ...prev,
          availability: {
            ...prev.availability,
            [day]: checked
          }
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const getPasswordRequirements = (password) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  }

  const isPasswordValid = (password) => {
    const requirements = getPasswordRequirements(password)
    return Object.values(requirements).every(req => req)
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Always validate email and password
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!isLogin && !isPasswordValid(formData.password)) {
      newErrors.password = 'Password does not meet requirements'
    }
    
    // Only validate registration-specific fields when not logging in
    if (!isLogin) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required'
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required'
      }
      
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required'
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      
      if (formData.role === 'mechanic') {
        if (!formData.businessName.trim()) {
          newErrors.businessName = 'Business name is required'
        }
        
        if (!formData.experience) {
          newErrors.experience = 'Experience is required'
        }
        
        if (!formData.location.address.trim()) {
          newErrors['location.address'] = 'Address is required'
        }
        
        if (!formData.location.city.trim()) {
          newErrors['location.city'] = 'City is required'
        }
        
        if (!formData.location.state.trim()) {
          newErrors['location.state'] = 'State is required'
        }
        
        if (!formData.pricing.hourlyRate || formData.pricing.hourlyRate <= 0) {
          newErrors['pricing.hourlyRate'] = 'Valid hourly rate is required'
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password, formData.role)
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard')
        } else if (result.user.role === 'mechanic') {
          navigate('/mechanic/dashboard')
        } else {
          const pendingEmergency = localStorage.getItem('pendingEmergencyBooking')
          const pendingInquiry = localStorage.getItem('pendingInquiry')
          
          if (pendingEmergency) {
            navigate('/client/emergency', { state: { autoSubmit: true } })
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
      } else {
        // Save form data to localStorage for verification page
        localStorage.setItem('pendingAccountData', JSON.stringify(formData))
        // Navigate to verification page
        navigate('/verify-account')
      }
    } catch (error) {
      console.error('Auth error:', error)
      // Error is handled by the auth context
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`${!isLogin && formData.role === 'mechanic' ? 'max-w-5xl' : 'max-w-md'} mx-auto w-full space-y-8`}>
        <div>
          <div className="flex justify-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl">
              <Wrench className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={`mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${errors.firstName ? 'border-red-500' : ''}`}
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={`mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${errors.lastName ? 'border-red-500' : ''}`}
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className={`mt-1 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${errors.phone ? 'border-red-500' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  I am a:
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center px-4 py-3 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all duration-200 flex-1 justify-center">
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={formData.role === 'client'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Client</span>
                  </label>
                  <label className="flex items-center px-4 py-3 bg-white border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-all duration-200 flex-1 justify-center">
                    <input
                      type="radio"
                      name="role"
                      value="mechanic"
                      checked={formData.role === 'mechanic'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <Wrench className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Mechanic</span>
                  </label>
                </div>
              </div>
              
              {/* Mechanic-specific fields */}
              {!isLogin && formData.role === 'mechanic' && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                  
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                      Business Name
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      className={`mt-1 input ${errors.businessName ? 'border-red-500' : ''}`}
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specializations
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {specializations.map(spec => (
                        <label key={spec} className="flex items-center">
                          <input
                            type="checkbox"
                            name="specialization"
                            value={spec}
                            checked={formData.specialization.includes(spec)}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          <span className="text-sm">{spec}</span>
                        </label>
                      ))}
                    </div>
                    {errors.specialization && (
                      <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                      Years of Experience
                    </label>
                    <input
                      id="experience"
                      name="experience"
                      type="number"
                      min="0"
                      max="50"
                      required
                      className={`mt-1 input ${errors.experience ? 'border-red-500' : ''}`}
                      value={formData.experience}
                      onChange={handleChange}
                    />
                    {errors.experience && (
                      <p className="mt-1 text-sm text-red-600">{errors.experience}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Business Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      className="mt-1 input"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell customers about your business and services..."
                    />
                  </div>

                  <h3 className="text-lg font-medium text-gray-900">Business Location</h3>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <input
                      id="address"
                      name="location.address"
                      type="text"
                      required
                      className={`mt-1 input ${errors['location.address'] ? 'border-red-500' : ''}`}
                      value={formData.location.address}
                      onChange={handleChange}
                    />
                    {errors['location.address'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['location.address']}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        id="city"
                        name="location.city"
                        type="text"
                        required
                        className={`mt-1 input ${errors['location.city'] ? 'border-red-500' : ''}`}
                        value={formData.location.city}
                        onChange={handleChange}
                      />
                      {errors['location.city'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['location.city']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State
                      </label>
                      <input
                        id="state"
                        name="location.state"
                        type="text"
                        required
                        className={`mt-1 input ${errors['location.state'] ? 'border-red-500' : ''}`}
                        value={formData.location.state}
                        onChange={handleChange}
                      />
                      {errors['location.state'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['location.state']}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      name="location.zipCode"
                      type="text"
                      className="mt-1 input"
                      value={formData.location.zipCode}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="serviceRadius" className="block text-sm font-medium text-gray-700">
                      Service Radius (miles)
                    </label>
                    <input
                      id="serviceRadius"
                      name="serviceRadius"
                      type="number"
                      min="1"
                      max="100"
                      className="mt-1 input"
                      value={formData.serviceRadius}
                      onChange={handleChange}
                      placeholder="How far you're willing to travel for service calls"
                    />
                  </div>

                  <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                        Hourly Rate ($)
                      </label>
                      <input
                        id="hourlyRate"
                        name="pricing.hourlyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className={`mt-1 input ${errors['pricing.hourlyRate'] ? 'border-red-500' : ''}`}
                        value={formData.pricing.hourlyRate}
                        onChange={handleChange}
                      />
                      {errors['pricing.hourlyRate'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['pricing.hourlyRate']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="diagnosticFee" className="block text-sm font-medium text-gray-700">
                        Diagnostic Fee ($)
                      </label>
                      <input
                        id="diagnosticFee"
                        name="pricing.diagnosticFee"
                        type="number"
                        min="0"
                        step="0.01"
                        className="mt-1 input"
                        value={formData.pricing.diagnosticFee}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {certifications.map(cert => (
                        <label key={cert} className="flex items-center">
                          <input
                            type="checkbox"
                            name="certifications"
                            value={cert}
                            checked={formData.certifications.includes(cert)}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          <span className="text-sm">{cert}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(formData.availability).map(([day, available]) => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`availability.${day}`}
                            checked={available}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          <span className="text-sm capitalize">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`mt-1 input ${errors.email ? 'border-red-500' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login as
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="loginRole"
                    value="client"
                    checked={formData.role === 'client'}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Client</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="loginRole"
                    value="mechanic"
                    checked={formData.role === 'mechanic'}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Mechanic</span>
                </label>
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                className={`mt-1 input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            {!isLogin && formData.password && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                <div className="space-y-1">
                  <RequirementCheck
                    met={getPasswordRequirements(formData.password).minLength}
                    text="At least 8 characters"
                  />
                  <RequirementCheck
                    met={getPasswordRequirements(formData.password).hasUppercase}
                    text="At least one uppercase letter"
                  />
                  <RequirementCheck
                    met={getPasswordRequirements(formData.password).hasLowercase}
                    text="At least one lowercase letter"
                  />
                  <RequirementCheck
                    met={getPasswordRequirements(formData.password).hasNumber}
                    text="At least one number"
                  />
                  <RequirementCheck
                    met={getPasswordRequirements(formData.password).hasSymbol}
                    text="At least one symbol (!@#$%^&*())"
                  />
                </div>
              </div>
            )}
          </div>
          
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={`mt-1 input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full btn-primary py-3 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign in' : 'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAccountPage
