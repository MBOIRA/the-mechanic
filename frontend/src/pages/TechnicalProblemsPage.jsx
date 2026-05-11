import { useState } from 'react'
import { inquiriesAPI } from '../services/api'
import { 
  AlertTriangle, 
  Wrench, 
  Send,
  CheckCircle,
  Monitor,
  Smartphone,
  Wifi,
  RefreshCw
} from 'lucide-react'

const TechnicalProblemsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: '',
    description: '',
    steps: '',
    browser: '',
    device: '',
    urgency: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const issueTypes = [
    'Login/Authentication Issues',
    'Booking Problems',
    'Payment Issues',
    'Profile/Account Issues',
    'Search/Filter Problems',
    'Mobile App Issues',
    'Performance Issues',
    'Other Technical Issue'
  ]

  const browsers = [
    'Chrome',
    'Firefox',
    'Safari',
    'Edge',
    'Other'
  ]

  const devices = [
    'Desktop Computer',
    'Laptop',
    'Smartphone',
    'Tablet',
    'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const inquiryData = {
        ...formData,
        subject: `Technical Issue: ${formData.issueType}`,
        message: `
Issue Type: ${formData.issueType}
Description: ${formData.description}
Steps to Reproduce: ${formData.steps}
Browser: ${formData.browser}
Device: ${formData.device}
Urgency: ${formData.urgency}
        `.trim(),
        category: 'technical',
        priority: formData.urgency
      }
      
      await inquiriesAPI.create(inquiryData)
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting technical issue:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success-100 mb-6">
              <CheckCircle className="h-8 w-8 text-success-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Technical Issue Reported
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for reporting this issue. Our technical team will investigate and get back to you soon.
            </p>
            
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-warning-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-warning-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Report a Technical Issue
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experiencing technical problems? Let us know what's happening and we'll help resolve it quickly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Technical Issue Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Issue Details
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="input"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type
                  </label>
                  <select
                    id="issueType"
                    name="issueType"
                    required
                    className="input"
                    value={formData.issueType}
                    onChange={handleChange}
                  >
                    <option value="">Select an issue type</option>
                    {issueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="browser" className="block text-sm font-medium text-gray-700 mb-2">
                      Browser
                    </label>
                    <select
                      id="browser"
                      name="browser"
                      className="input"
                      value={formData.browser}
                      onChange={handleChange}
                    >
                      <option value="">Select browser</option>
                      {browsers.map(browser => (
                        <option key={browser} value={browser}>{browser}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="device" className="block text-sm font-medium text-gray-700 mb-2">
                      Device Type
                    </label>
                    <select
                      id="device"
                      name="device"
                      className="input"
                      value={formData.device}
                      onChange={handleChange}
                    >
                      <option value="">Select device</option>
                      {devices.map(device => (
                        <option key={device} value={device}>{device}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="input"
                    placeholder="Please describe the issue you're experiencing in detail..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    id="steps"
                    name="steps"
                    rows={3}
                    className="input"
                    placeholder="What steps did you take that led to this issue?"
                    value={formData.steps}
                    onChange={handleChange}
                  />
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
                    <option value="low">Low - Minor inconvenience</option>
                    <option value="medium">Medium - Affecting usability</option>
                    <option value="high">High - Blocking important features</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-lg font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting Issue...
                    </div>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Report Issue
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div className="space-y-6">
            {/* Quick Fixes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Fixes
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <RefreshCw className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Refresh the Page</p>
                    <p className="text-gray-600 text-xs">Sometimes a simple refresh resolves the issue.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Wifi className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Check Internet Connection</p>
                    <p className="text-gray-600 text-xs">Ensure you have a stable internet connection.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Monitor className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Clear Browser Cache</p>
                    <p className="text-gray-600 text-xs">Clear your browser cache and cookies.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Smartphone className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Try Different Browser</p>
                    <p className="text-gray-600 text-xs">Test with a different browser or device.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Common Issues
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="font-medium text-blue-900 text-sm">Login Problems</p>
                  <p className="text-blue-700 text-xs">Check email/password, try password reset.</p>
                </div>
                <div>
                  <p className="font-medium text-blue-900 text-sm">Booking Not Working</p>
                  <p className="text-blue-700 text-xs">Ensure all required fields are filled.</p>
                </div>
                <div>
                  <p className="font-medium text-blue-900 text-sm">Payment Issues</p>
                  <p className="text-blue-700 text-xs">Verify card details and billing address.</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Still Need Help?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                If the issue persists, contact our support team:
              </p>
              <div className="space-y-2">
                <a href="/inquiries" className="btn-primary w-full justify-center text-sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </a>
                <a href="tel:1-800-MECHANIC" className="btn-secondary w-full justify-center text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicalProblemsPage
