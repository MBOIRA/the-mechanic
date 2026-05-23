import axios from 'axios'
import API_BASE_URL from '../config/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect if not already on login/home page
      if (window.location.pathname !== '/' && window.location.pathname !== '/create-account') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
}

// Services API
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
}

// Mechanics API
export const mechanicsAPI = {
  getAll: (params) => api.get('/mechanics', { params }),
  getById: (id) => api.get(`/mechanics/${id}`),
  create: (data) => api.post('/mechanics', data),
  update: (id, data) => api.put(`/mechanics/${id}`, data),
  getMyProfile: () => api.get('/mechanics/profile/me'),
  updateAvailability: (id, availability) => api.put(`/mechanics/${id}/availability`, { availability }),
}

// Bookings API
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  addNote: (id, content) => api.post(`/bookings/${id}/notes`, { content }),
  rateBooking: (id, rating) => api.post(`/bookings/${id}/rating`, rating),
}

// Inquiries API
export const inquiriesAPI = {
  getAll: (params) => api.get('/inquiries', { params }),
  getById: (id) => api.get(`/inquiries/${id}`),
  create: (data) => api.post('/inquiries', data),
  updateStatus: (id, status) => api.put(`/inquiries/${id}/status`, { status }),
  respond: (id, content) => api.post(`/inquiries/${id}/response`, { content }),
}

// Emergency API
export const emergencyAPI = {
  getServices: () => api.get('/emergency/services'),
  submitRequest: (data) => api.post('/emergency', data),
  getNearbyMechanics: (params) => api.get('/emergency/mechanics', { params }),
  trackRequest: (requestId) => api.get(`/emergency/track/${requestId}`),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteProfile: () => api.delete('/users/profile'),
  getAll: (params) => api.get('/users', { params }),
}

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
  test: () => api.get('/test'),
}

export default api
