import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { inquiriesAPI } from '../services/api'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send,
  CheckCircle,
  Star,
  MessageCircle,
  AlertCircle
} from 'lucide-react'

const InquiriesPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  })
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if inquiry was auto-submitted after login/registration
    if (location.state?.inquirySubmitted) {
      setSubmitted(true)
    }
  }, [location.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRatingSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      navigate('/create-account', { state: { fromInquiry: true } })
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const submissionData = {
        subject: 'Platform Rating',
        message: `User rated the platform ${rating} stars`,
        category: 'suggestion',
        priority: 'low',
        rating: rating,
        userId: user?.id || null
      }
      const response = await inquiriesAPI.create(submissionData)
      console.log('Rating submitted:', response.data)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting rating:', error)
      const msg = error.response?.data?.errors?.map(e => e.msg).join(', ') || error.response?.data?.message || 'Failed to submit rating. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // If not authenticated, store form data and redirect to login
    if (!isAuthenticated) {
      localStorage.setItem('pendingInquiry', JSON.stringify(formData))
      navigate('/create-account', { state: { fromInquiry: true } })
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const submissionData = {
        ...formData,
        userId: user?.id || null
      }
      const response = await inquiriesAPI.create(submissionData)
      console.log('Inquiry submitted:', response.data)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting inquiry:', error)
      const msg = error.response?.data?.errors?.map(e => e.msg).join(', ') || error.response?.data?.message || 'Failed to submit inquiry. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Inquiry Submitted Successfully
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for contacting us. Our team will review your inquiry and get back to you within 24 hours.
            </p>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-6 shadow-xl">
            <MessageSquare className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Need assistance or have feedback? Send a message directly to our Admin Support team and we'll respond promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Send Message Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
                Send us a Message
              </h2>
              
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="complaint">Complaint</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm resize-none"
                    placeholder="Please describe your inquiry in detail..."
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending Message...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Rate Us Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-6">
                Rate Our Platform
              </h2>
              <p className="text-gray-600 mb-6">
                How would you rate your experience with our platform? Your feedback helps us improve.
              </p>
              
              <form onSubmit={handleRatingSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Select Your Rating
                  </label>
                  <div className="flex items-center justify-center space-x-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none transform hover:scale-125 transition-transform duration-200"
                      >
                        <Star 
                          className={`h-12 w-12 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting Rating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Star className="h-5 w-5 mr-2" />
                      Submit Rating
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                Other Ways to Reach Us
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                    <a href="tel:+256753926638" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      +256 753926638
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors duration-200">
                  <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">WhatsApp</p>
                    <p className="text-sm text-gray-600">Instant messaging</p>
                    <a href="https://wa.me/256753926638" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 text-sm font-medium">
                      +256 753926638
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors duration-200">
                  <Mail className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">Response within 24 hours</p>
                    <a href="mailto:mboiraisaac36@gmail.com" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      mboiraisaac36@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">
                Emergency Assistance
              </h3>
              <p className="text-red-100 text-sm mb-4">
                For immediate roadside assistance or emergencies:
              </p>
              <a href="/emergency" className="block w-full py-3 bg-white text-red-600 rounded-xl font-semibold text-center hover:bg-red-50 transition-colors duration-200">
                <Phone className="h-4 w-4 mr-2 inline" />
                Get Emergency Help
              </a>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="font-semibold text-gray-900 text-sm">How do I book a mechanic?</p>
                  <p className="text-gray-600 text-xs mt-1">Browse mechanics and click "Book Service" on their profile.</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="font-semibold text-gray-900 text-sm">Are mechanics verified?</p>
                  <p className="text-gray-600 text-xs mt-1">Yes, all mechanics undergo background checks and verification.</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="font-semibold text-gray-900 text-sm">What payment methods are accepted?</p>
                  <p className="text-gray-600 text-xs mt-1">We accept credit cards, debit cards, and digital payments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InquiriesPage
