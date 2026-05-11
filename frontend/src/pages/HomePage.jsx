import { Link } from 'react-router-dom'
import React from 'react'
import { 
  Wrench, 
  Phone, 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  ArrowRight,
  CheckCircle,
  Users
} from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: <Wrench className="h-8 w-8 text-primary-600" />,
      title: 'Expert Mechanics',
      description: 'Connect with certified and experienced mechanics for all your vehicle needs.'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: '24/7 Emergency Service',
      description: 'Get roadside assistance anytime, anywhere with our emergency support network.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Verified Professionals',
      description: 'All mechanics are background-checked and verified for your safety and peace of mind.'
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary-600" />,
      title: 'Location-Based Search',
      description: 'Find mechanics near you with our intelligent location matching system.'
    },
    {
      icon: <Star className="h-8 w-8 text-primary-600" />,
      title: 'Ratings & Reviews',
      description: 'Make informed decisions with genuine reviews from real customers.'
    },
    {
      icon: <Phone className="h-8 w-8 text-primary-600" />,
      title: 'Easy Booking',
      description: 'Book services instantly with our simple and intuitive booking system.'
    }
  ]

  const services = [
    { name: 'Engine Repair', description: 'Complete engine diagnostics and repair services' },
    { name: 'Brake Service', description: 'Brake inspection, repair, and replacement' },
    { name: 'Oil Change', description: 'Quick and reliable oil change services' },
    { name: 'Transmission', description: 'Transmission repair and maintenance' },
    { name: 'AC & Heating', description: 'Climate control system repair and service' },
    { name: 'Electrical', description: 'Electrical system diagnostics and repair' }
  ]

  const stats = [
    { number: '500+', label: 'Verified Mechanics' },
    { number: '10,000+', label: 'Happy Customers' },
    { number: '24/7', label: 'Emergency Support' },
    { number: '4.8★', label: 'Average Rating' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-8 shadow-2xl">
              <Wrench className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Your Trusted Vehicle Service Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with certified mechanics for roadside assistance and garage services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/mechanics"
                className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                Find Mechanics
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/emergency"
                className="px-10 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                Emergency Help
                <Phone className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 border-b border-gray-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Why Choose Mechanics Hub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make vehicle maintenance simple, reliable, and convenient
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                <div className="mb-4 p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl inline-block">
                  {React.cloneElement(feature.icon, { className: 'h-8 w-8 text-blue-600' })}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive vehicle services to keep you on the road
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/mechanics"
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 shadow-xl">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Mechanics Hub for their vehicle needs
          </p>
          <Link
            to="/create-account"
            className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
