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
  Users,
  Settings,
  Car,
  AlertTriangle
} from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: <Wrench className="h-8 w-8 text-primary-500" />,
      title: 'Expert Mechanics',
      description: 'Connect with certified and experienced mechanics for all your vehicle needs.'
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-500" />,
      title: '24/7 Emergency Service',
      description: 'Get roadside assistance anytime, anywhere with our emergency support network.'
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-500" />,
      title: 'Verified Professionals',
      description: 'All mechanics are background-checked and verified for your safety and peace of mind.'
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary-500" />,
      title: 'Location-Based Search',
      description: 'Find mechanics near you with our intelligent location matching system.'
    },
    {
      icon: <Star className="h-8 w-8 text-primary-500" />,
      title: 'Ratings & Reviews',
      description: 'Make informed decisions with genuine reviews from real customers.'
    },
    {
      icon: <Phone className="h-8 w-8 text-primary-500" />,
      title: 'Easy Booking',
      description: 'Book services instantly with our simple and intuitive booking system.'
    }
  ]

  const services = [
    { name: 'Engine Diagnostics', description: 'Comprehensive scanning and troubleshooting for engine faults' },
    { name: 'Brake Repair', description: 'Pad replacement, rotor resurfacing, and brake fluid checks' },
    { name: 'Routine Maintenance', description: 'Oil changes, filter replacements, and fluid top-ups' },
    { name: 'Transmission Services', description: 'Fluid flushes, diagnostics, and complete overhauls' },
    { name: 'AC & Climate Control', description: 'Recharge, leak detection, and compressor repair' },
    { name: 'Electrical Systems', description: 'Battery testing, alternator repair, and wiring fixes' }
  ]

  const stats = [
    { number: '500+', label: 'Verified Mechanics' },
    { number: '10,000+', label: 'Happy Customers' },
    { number: '24/7', label: 'Emergency Support' },
    { number: '4.8★', label: 'Average Rating' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 text-white min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1920&q=80" 
            alt="Mechanic working on car engine" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 mb-8 backdrop-blur-sm">
              <Settings className="h-4 w-4 animate-spin-slow" />
              <span className="text-sm font-semibold tracking-wider uppercase">The Ultimate Mechanics Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Professional Auto Care <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                At Your Fingertips
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-gray-300 font-light">
              Connect instantly with certified mechanics for expert garage services and 24/7 roadside assistance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                to="/mechanics"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:bg-primary-500 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-lg"
              >
                <Car className="mr-2 h-5 w-5" />
                Find a Mechanic
              </Link>
              <Link
                to="/emergency"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg font-bold hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-lg group"
              >
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500 group-hover:animate-pulse" />
                Emergency Help
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-10 pointer-events-none hidden lg:block">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-primary-500" preserveAspectRatio="none">
            <polygon points="100,0 100,100 0,100" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 border-t border-gray-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 border-r border-gray-800 last:border-0">
                <div className="text-4xl md:text-5xl font-black text-primary-500 mb-2 font-mono">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-2">Why Choose Us</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Driven by Excellence
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a seamless experience to keep your vehicle running smoothly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-100 transform hover:-translate-y-1 transition-all duration-300 group">
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl inline-block group-hover:bg-primary-50 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with dark theme */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold text-primary-500 uppercase tracking-widest mb-2">Capabilities</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold mb-4">
                Comprehensive Auto Services
              </h3>
              <p className="text-xl text-gray-400">
                From routine maintenance to complex engine diagnostics, our network of mechanics has you covered.
              </p>
            </div>
            <Link
              to="/mechanics"
              className="hidden md:inline-flex px-6 py-3 border-2 border-primary-500 text-primary-400 rounded-lg font-bold hover:bg-primary-500 hover:text-white transition-all duration-300 items-center"
            >
              View All Mechanics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-2xl p-8 hover:border-primary-500 transition-all duration-300 group">
                <div className="flex items-start">
                  <div className="mt-1">
                    <CheckCircle className="h-6 w-6 text-primary-500" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {service.name}
                    </h4>
                    <p className="text-gray-400">{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link
              to="/mechanics"
              className="inline-flex px-6 py-3 border-2 border-primary-500 text-primary-400 rounded-lg font-bold hover:bg-primary-500 hover:text-white transition-all duration-300 items-center w-full justify-center"
            >
              View All Mechanics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-primary-600 text-white">
        {/* Mechanic texture/pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md mb-8 border border-white/20 shadow-2xl">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Join the Hub?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto font-medium">
            Whether you need a reliable mechanic or you're a professional looking for clients, Mechanics Hub is your ultimate platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-account"
              className="px-10 py-4 bg-gray-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transform hover:-translate-y-1 transition-all duration-300"
            >
              Create Free Account
            </Link>
            <Link
              to="/mechanics"
              className="px-10 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold hover:bg-white/30 transition-all duration-300"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
