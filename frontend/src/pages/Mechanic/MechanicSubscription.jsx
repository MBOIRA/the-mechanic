import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Crown, 
  Check, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Zap,
  Shield
} from 'lucide-react'

const MechanicSubscription = () => {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState('6_months')
  const [activePlan, setActivePlan] = useState(null)

  useEffect(() => {
    const storedPlan = localStorage.getItem('mechanicActivePlan')
    if (storedPlan) {
      setActivePlan(JSON.parse(storedPlan))
    }
  }, [])

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 29,
      period: 'month',
      description: 'Perfect for flexibility and short-term commitment',
      features: [
        'Unlimited bookings',
        'Enhanced profile listing',
        'Customer reviews',
        'Email support',
        'Mobile app access'
      ],
      notIncluded: [
        'Priority placement',
        'Advanced analytics'
      ],
      popular: false
    },
    {
      id: '6_months',
      name: '6 Months',
      price: 150,
      period: '6 months',
      description: 'Ideal for consistent mechanics, save over 10%',
      features: [
        'Everything in Monthly',
        'Priority placement in search',
        'Advanced analytics dashboard',
        'Customer management tools',
        'Phone support'
      ],
      notIncluded: [
        'Dedicated account manager'
      ],
      popular: true
    },
    {
      id: 'annually',
      name: 'Annually',
      price: 280,
      period: 'year',
      description: 'Best value for established businesses, save 20%',
      features: [
        'Everything in 6 Months',
        'Featured placement on homepage',
        'Dedicated account manager',
        'Custom branding options',
        'API access',
        'Marketing analytics'
      ],
      notIncluded: [],
      popular: false
    }
  ]

  const handleSubscribeClick = (planId) => {
    const selected = plans.find(p => p.id === planId)
    navigate('/mechanic/payment', { state: { plan: selected } })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your mechanic business. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Current Plan Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Current Plan: {activePlan ? activePlan.name : 'Basic'}
              </h2>
              <p className="text-gray-600">
                {activePlan 
                  ? `Your plan expires on ${activePlan.expiryDate}` 
                  : 'Your plan renews on December 15, 2024'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {activePlan ? `$${activePlan.price}/${activePlan.period}` : '$29/month'}
              </p>
              <p className="text-sm text-gray-600">
                {activePlan 
                  ? `Active since ${activePlan.activationDate}` 
                  : 'Active since Nov 15, 2024'}
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative ${
                plan.popular ? 'border-2 border-primary-500 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="badge-info flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="card-header text-center">
                <h3 className="card-title text-xl">{plan.name}</h3>
                <p className="card-description">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>

              <div className="card-content">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-success-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                  
                  {plan.notIncluded.map((feature, index) => (
                    <li key={index} className="flex items-start opacity-50">
                      <div className="h-5 w-5 border border-gray-300 rounded-full mr-3 flex-shrink-0 mt-0.5"></div>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-footer">
                <button
                  onClick={() => handleSubscribeClick(plan.id)}
                  className={`w-full py-3 font-semibold ${
                    plan.popular
                      ? 'btn-primary'
                      : selectedPlan === plan.id
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="card mb-12">
          <div className="card-header text-center">
            <h2 className="card-title">Compare Plans</h2>
            <p className="card-description">See all features side by side</p>
          </div>
          <div className="card-content">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      6 Months
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annually
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Monthly Bookings
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      Unlimited
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Profile Customization
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Priority Placement
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="h-5 w-5 border border-gray-300 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Analytics Dashboard
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="h-5 w-5 border border-gray-300 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Phone Support
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="h-5 w-5 border border-gray-300 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Dedicated Account Manager
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="h-5 w-5 border border-gray-300 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="h-5 w-5 border border-gray-300 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Check className="h-5 w-5 text-success-600 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="card">
          <div className="card-header text-center">
            <h2 className="card-title">Frequently Asked Questions</h2>
            <p className="card-description">Common questions about our subscription plans</p>
          </div>
          <div className="card-content">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Can I change my plan anytime?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What happens if I exceed my booking limit?
                </h3>
                <p className="text-gray-600">
                  On the Basic plan, you'll be notified when you approach your limit. You can upgrade to Professional for unlimited bookings.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Is there a contract or commitment?
                </h3>
                <p className="text-gray-600">
                  No, all plans are month-to-month. You can cancel anytime without penalties.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept Credit/Debit cards, PayPal, MTN Mobile Money, and Airtel Money.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default MechanicSubscription
