import React, { useState, useEffect } from 'react'
import { Star, X } from 'lucide-react'

const AppRatingPopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if the user has already seen/dismissed the popup recently
    const hasSeenRating = localStorage.getItem('hasSeenAppRating')
    if (!hasSeenRating) {
      // Show the popup 10 seconds after entering the application
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 10000)
      return () => clearTimeout(timer)
    }

    // Also allow triggering manually via an event (e.g., after successful task)
    const handleShowRating = () => setIsOpen(true)
    window.addEventListener('show-rating-popup', handleShowRating)
    return () => window.removeEventListener('show-rating-popup', handleShowRating)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('hasSeenAppRating', 'true')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Submitting to inquiries as a generic suggestion since no signup is required
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Anonymous User',
          email: 'anonymous@themechanic.com',
          subject: 'Application Rating',
          message: review.trim() || `Rating: ${rating} Stars`,
          category: 'suggestion',
          rating: rating
        })
      })

      if (response.ok) {
        setSubmitted(true)
        localStorage.setItem('hasSeenAppRating', 'true')
        setTimeout(() => setIsOpen(false), 3000)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to submit rating')
      }
    } catch (error) {
      setError('An error occurred while submitting your rating')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative p-6 animate-slide-up">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 fill-current" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your feedback helps us improve The Mechanic Hub.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">How are we doing?</h3>
              <p className="text-gray-500 mt-2">We'd love to hear your thoughts about the app!</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us what you like or what could be better (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Later
                </button>
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="flex-1 py-3 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default AppRatingPopup
