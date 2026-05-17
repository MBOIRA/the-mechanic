import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import PublicLayout from './components/PublicLayout'
import ClientLayout from './components/ClientLayout'
import MechanicLayout from './components/MechanicLayout'
import HomePage from './pages/HomePage'
import MechanicsPage from './pages/MechanicsPage'
import CreateAccountPage from './pages/CreateAccountPage'
import AccountVerification from './pages/AccountVerification'

import InquiriesPage from './pages/InquiriesPage'
import TechnicalProblemsPage from './pages/TechnicalProblemsPage'

// Components
import AppRatingPopup from './components/AppRatingPopup'

// Client Pages
import ClientDashboard from './pages/Client/ClientDashboard'
import ClientGetMechanic from './pages/Client/ClientGetMechanic'
import ClientProfile from './pages/Client/ClientProfile'
import ClientHistory from './pages/Client/ClientHistory'
import BookingForm from './pages/Client/BookingForm'
import ClientBookings from './pages/Client/ClientBookings'
import BookingDetails from './pages/Client/BookingDetails'
import EmergencyBooking from './pages/Client/EmergencyBooking'
import EmergencyMechanics from './pages/Client/EmergencyMechanics'
import ClientNotifications from './pages/Client/ClientNotifications'

// Mechanic Pages
import MechanicDashboard from './pages/Mechanic/MechanicDashboard'
import MechanicNotifications from './pages/Mechanic/MechanicNotifications'
import MechanicProfile from './pages/Mechanic/MechanicProfile'
import MechanicStatistics from './pages/Mechanic/MechanicStatistics'
import MechanicSubscription from './pages/Mechanic/MechanicSubscription'
import MechanicPayment from './pages/Mechanic/MechanicPayment'
import MechanicBookings from './pages/Mechanic/MechanicBookings'
import MechanicBookingDetails from './pages/Mechanic/MechanicBookingDetails'
import MechanicHistory from './pages/Mechanic/MechanicHistory'
import CreateInvoice from './pages/Mechanic/CreateInvoice'

// Admin Pages
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminSupport from './pages/Admin/AdminSupport'
import AdminProfile from './pages/Admin/AdminProfile'
import AdminPayments from './pages/Admin/AdminPayments'

function App() {
  const { isAuthenticated, isClient, isMechanic, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppRatingPopup />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="mechanics" element={<MechanicsPage />} />
          <Route path="create-account" element={<CreateAccountPage />} />
          <Route path="verify-account" element={<AccountVerification />} />
          <Route path="emergency" element={<EmergencyBooking />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="technical-problems" element={<TechnicalProblemsPage />} />
          <Route path="emergency-mechanics" element={<EmergencyMechanics />} />
          <Route path="book/:mechanicId" element={<BookingForm />} />
        </Route>

        {/* Client Routes */}
        <Route path="/client" element={isClient ? <ClientLayout /> : <Navigate to="/create-account" />}>
          <Route index element={<Navigate to="/client/dashboard" />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="get-mechanic" element={<ClientGetMechanic />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="history" element={<ClientHistory />} />
          <Route path="bookings" element={<ClientBookings />} />
          <Route path="bookings/:bookingId" element={<BookingDetails />} />
          <Route path="notifications" element={<ClientNotifications />} />
          <Route path="emergency" element={<EmergencyBooking />} />
          <Route path="emergency-mechanics" element={<EmergencyMechanics />} />
        </Route>

        {/* Mechanic Routes */}
        <Route path="/mechanic" element={isMechanic ? <MechanicLayout /> : <Navigate to="/create-account" />}>
          <Route index element={<Navigate to="/mechanic/dashboard" />} />
          <Route path="dashboard" element={<MechanicDashboard />} />
          <Route path="bookings" element={<MechanicBookings />} />
          <Route path="history" element={<MechanicHistory />} />
          <Route path="bookings/:bookingId" element={<MechanicBookingDetails />} />
          <Route path="bookings/:bookingId/create-invoice" element={<CreateInvoice />} />
          <Route path="notifications" element={<MechanicNotifications />} />
          <Route path="profile" element={<MechanicProfile />} />
          <Route path="statistics" element={<MechanicStatistics />} />
          <Route path="subscription" element={<MechanicSubscription />} />
          <Route path="payment" element={<MechanicPayment />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/create-account" />}>
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
