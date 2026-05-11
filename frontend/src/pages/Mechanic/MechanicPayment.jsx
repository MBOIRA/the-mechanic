import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, ArrowLeft, Calendar as CalendarIcon, Plus, Minus, CheckCircle } from 'lucide-react'

const MechanicPayment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [paymentMethod, setPaymentMethod] = useState('')
  const [quantity, setQuantity] = useState(1)
  
  // Form states
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [paypalPassword, setPaypalPassword] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const plan = location.state?.plan

  useEffect(() => {
    if (!plan) {
      navigate('/mechanic/subscription')
    }
  }, [plan, navigate])

  const calculateExpiryDate = (period, qty) => {
    const date = new Date()
    if (period === 'month') {
      date.setMonth(date.getMonth() + (1 * qty))
    } else if (period === '6 months') {
      date.setMonth(date.getMonth() + (6 * qty))
    } else if (period === 'year') {
      date.setFullYear(date.getFullYear() + (1 * qty))
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const totalPrice = useMemo(() => plan ? plan.price * quantity : 0, [plan, quantity])
  const expiryDate = useMemo(() => plan ? calculateExpiryDate(plan.period, quantity) : '', [plan, quantity])

  if (!plan) return null

  const handlePaymentConfirm = () => {
    if (!paymentMethod) {
      alert('Please select a payment method')
      return
    }

    // Basic validation
    if (paymentMethod === 'Card') {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        alert('Please fill in all card details')
        return
      }
    } else if (paymentMethod === 'PayPal') {
      if (!paypalEmail || !paypalPassword) {
        alert('Please enter your PayPal email and password')
        return
      }
    } else if (paymentMethod === 'MTN Mobile Money' || paymentMethod === 'Airtel Money') {
      if (!mobileNumber) {
        alert(`Please enter your ${paymentMethod} number`)
        return
      }
    }

    // In a real application, this would integrate with a payment processor
    const activePlanDetails = {
      name: plan.name,
      price: plan.price,
      period: plan.period,
      quantity,
      totalPrice,
      expiryDate,
      activationDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    localStorage.setItem('mechanicActivePlan', JSON.stringify(activePlanDetails))

    setIsSuccess(true)
  }

  const renderPaymentFormContent = () => {
    return (
      <div className="transition-all duration-300">
        {paymentMethod === 'Card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <input 
                type="text" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input 
                type="text" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 tracking-wider" 
                placeholder="0000 0000 0000 0000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input 
                  type="text" 
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'PayPal' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                You will be redirected to PayPal's secure platform to complete your payment, but you can enter your details below for this demonstration.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email Address</label>
              <input 
                type="email" 
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Password</label>
              <input 
                type="password" 
                value={paypalPassword}
                onChange={(e) => setPaypalPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" 
                placeholder="••••••••"
              />
            </div>
          </div>
        )}

        {(paymentMethod === 'MTN Mobile Money' || paymentMethod === 'Airtel Money') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-medium sm:text-base">
                  +256
                </span>
                <input 
                  type="tel" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-base tracking-wide" 
                  placeholder="770 000 000"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-8">Your subscription has been activated successfully.</p>
          
          <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left border border-gray-100 space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-gray-500">Plan</span>
              <span className="font-semibold text-gray-900">{plan.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-gray-500">Duration</span>
              <span className="font-semibold text-gray-900">{quantity}x {plan.period}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-semibold text-gray-900">${totalPrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Valid Until</span>
              <span className="font-semibold text-primary-700">{expiryDate}</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/mechanic/dashboard')}
            className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-colors shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/mechanic/subscription')}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
        <p className="text-gray-600 mb-8">Select a payment method and duration to securely process your subscription.</p>

        {/* Card 1: Subscription Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-200 bg-gray-50/80">
            <h2 className="text-lg font-bold text-gray-900">Subscription Details</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 pb-5 mb-5">
              <div>
                <span className="text-xl font-bold text-gray-900">{plan.name} Plan</span>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              </div>
              
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-md transition-all shadow-sm disabled:opacity-50 disabled:shadow-none"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="px-4 font-semibold text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-md transition-all shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Base Price</span>
                <span className="font-medium">${plan.price} <span className="text-gray-500 font-normal">/ {plan.period}</span></span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-gray-900 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-blue-900">New Expiry Date</span>
                </div>
                <span className="text-blue-700 font-bold">{expiryDate}</span>
              </div>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-3xl font-bold text-primary-600">${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Payment Method */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-200 bg-gray-50/80">
            <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 hover:border-primary-300'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Card" 
                  checked={paymentMethod === 'Card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                
                {/* Visa & Mastercard SVG combo */}
                <div className="flex flex-col mr-4">
                  <div className="flex gap-1 mb-1">
                    <svg viewBox="0 0 32 20" className="h-6 w-10" fill="none">
                      <rect width="32" height="20" rx="3" fill="#1A1F71"/>
                      <path d="M11.6 15.3l1.8-8.7h2.8L14.3 15.3h-2.7zm11.2-8.5c-.5-.2-1.4-.4-2.5-.4-2.7 0-4.6 1.4-4.6 3.4 0 1.5 1.4 2.3 2.4 2.8 1.1.5 1.4.9 1.4 1.3 0 .7-.9 1.1-1.7 1.1-1.4 0-2.2-.2-3.1-.6l-.4-.2-.4 2.6c.8.4 2.3.7 3.8.7 2.9 0 4.8-1.4 4.8-3.6 0-1.1-.7-2-2.3-2.7-1-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.6-.9 1.1 0 1.9.2 2.5.5l.3.1.4-2.3zM25.8 6.8c-.5 0-1 .2-1.2.8l-4.3 8.2h2.9l.6-1.5h3.5l.3 1.5h2.5L27.6 6.8h-1.8zm-1.3 5.3l1-2.1 1 2.1h-2zM8.9 6.8L7.1 12.7l-.3-1C6.4 10.5 5 8.9 3 8.2l1.8 7.1h2.9l2.7-8.5H8.9z" fill="#fff"/>
                      <path d="M6.8 8.2C5.5 7.9 4.2 7.7 2.7 7.6v-.1c2.1 0 4.4.5 5.6 1.4l-1.5-.7z" fill="#F7B600"/>
                    </svg>
                    <svg viewBox="0 0 32 20" className="h-6 w-10" fill="none">
                      <rect width="32" height="20" rx="3" fill="#141414"/>
                      <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                      <circle cx="20" cy="10" r="6" fill="#F79E1B"/>
                      <path d="M16 14.3c1.3-1 2-2.6 2-4.3s-.7-3.3-2-4.3c-1.3 1-2 2.6-2 4.3s.7 3.3 2 4.3z" fill="#FF5F00"/>
                    </svg>
                  </div>
                </div>

                <div className="flex-1">
                  <span className={`block font-semibold ${paymentMethod === 'Card' ? 'text-primary-900' : 'text-gray-900'}`}>Card</span>
                </div>
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${paymentMethod === 'Card' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'Card' && <div className="h-2.5 w-2.5 rounded-full bg-primary-600"></div>}
                </div>
              </label>
              
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'PayPal' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 hover:border-primary-300'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="PayPal" 
                  checked={paymentMethod === 'PayPal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                
                {/* PayPal SVG */}
                <svg viewBox="0 0 32 20" className="h-8 w-12 mr-4" fill="none">
                  <rect width="32" height="20" rx="3" fill="#003087"/>
                  <path d="M12.9 15.3l1.8-9.4c0-.2.2-.3.4-.3h4.4c2.1 0 3.6.5 4.3 1.6.5.7.6 1.6.4 2.8-.4 2.8-2.4 4.3-5 4.3h-1.8c-.2 0-.4.2-.4.4l-.8 4.3c0 .1-.2.2-.3.2h-2.5c-.2 0-.3-.2-.3-.3l-.2-2.1zm4.8-8.6h-1.8c-.1 0-.2.1-.2.2l-1 4.9c0 .1.1.2.2.2h1.6c1.6 0 2.9-.8 3.2-2.3.2-1-.1-1.7-.5-2.1-.5-.5-1.3-.6-2.5-.6z" fill="#009CDE"/>
                  <path d="M12.4 15.3l1.8-9.4c0-.2.2-.3.4-.3h4.4c1 0 1.9.1 2.5.4-.6-2.2-2.4-3.4-5.2-3.4h-4.4c-.2 0-.4.2-.4.4L9.8 12.6c0 .1.1.2.2.2h2.2c.1 0 .2-.1.2-.2l0 2.5z" fill="#0079C1"/>
                </svg>

                <div className="flex-1">
                  <span className={`block font-semibold ${paymentMethod === 'PayPal' ? 'text-primary-900' : 'text-gray-900'}`}>PayPal</span>
                </div>
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${paymentMethod === 'PayPal' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'PayPal' && <div className="h-2.5 w-2.5 rounded-full bg-primary-600"></div>}
                </div>
              </label>
              
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'MTN Mobile Money' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 hover:border-primary-300'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="MTN Mobile Money" 
                  checked={paymentMethod === 'MTN Mobile Money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                
                {/* MTN MoMo Mock Logo */}
                <div className="h-10 w-12 mr-4 bg-[#FFCC00] rounded flex items-center justify-center font-bold text-[#000000] text-xs leading-none text-center">
                  MTN<br/>MoMo
                </div>

                <div className="flex-1">
                  <span className={`block font-semibold ${paymentMethod === 'MTN Mobile Money' ? 'text-primary-900' : 'text-gray-900'}`}>MTN Mobile Money</span>
                </div>
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${paymentMethod === 'MTN Mobile Money' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'MTN Mobile Money' && <div className="h-2.5 w-2.5 rounded-full bg-primary-600"></div>}
                </div>
              </label>
              
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'Airtel Money' ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 shadow-sm' : 'border-gray-200 hover:border-primary-300'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Airtel Money" 
                  checked={paymentMethod === 'Airtel Money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="sr-only"
                />
                
                {/* Airtel Money Mock Logo */}
                <div className="h-10 w-12 mr-4 bg-[#FF0000] rounded flex items-center justify-center font-bold text-white text-xs leading-none text-center">
                  Airtel<br/>Money
                </div>

                <div className="flex-1">
                  <span className={`block font-semibold ${paymentMethod === 'Airtel Money' ? 'text-primary-900' : 'text-gray-900'}`}>Airtel Money</span>
                </div>
                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${paymentMethod === 'Airtel Money' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'Airtel Money' && <div className="h-2.5 w-2.5 rounded-full bg-primary-600"></div>}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Card 3: Enter Payment Details (Conditional) */}
        {paymentMethod && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 animate-fade-in-up">
            <div className="p-5 border-b border-gray-200 bg-gray-50/80">
              <h2 className="text-lg font-bold text-gray-900">Enter Payment Details</h2>
            </div>
            <div className="p-6">
              
              {renderPaymentFormContent()}

              <button 
                onClick={handlePaymentConfirm}
                disabled={!paymentMethod}
                className={`w-full mt-8 py-4 rounded-xl font-bold text-lg text-white transition-all transform ${
                  paymentMethod 
                    ? 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg active:scale-95' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {paymentMethod ? `Pay $${totalPrice} Now` : 'Select a Payment Method'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default MechanicPayment
