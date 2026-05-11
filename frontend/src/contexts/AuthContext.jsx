import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true,
        error: null 
      }
    case 'LOGIN_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false 
      }
    case 'LOGOUT':
      return { 
        ...state, 
        user: null, 
        token: null,
        isAuthenticated: false,
        loading: false 
      }
    case 'REGISTER_START':
      return { ...state, loading: true, error: null }
    case 'REGISTER_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: true,
        error: null 
      }
    case 'REGISTER_FAILURE':
      return { 
        ...state, 
        loading: false, 
        error: action.payload,
        isAuthenticated: false 
      }
    case 'UPDATE_PROFILE':
      return { 
        ...state, 
        user: { ...state.user, ...action.payload }
      }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Skip automatic auth check to prevent blank page
    // User will need to login manually
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [])

  const API_URL = 'http://localhost:5000/api'

const login = async (email, password, role = null) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      console.log('Login attempt:', { email, role })
      
      const requestBody = { email, password }
      if (role) {
        requestBody.role = role
      }
      
      console.log('Sending to backend:', requestBody)
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      
      localStorage.setItem('token', data.token)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: data.user,
          token: data.token
        }
      })
      
      console.log('Login successful, user:', data.user)
      
      return { user: data.user, token: data.token }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.message || 'Login failed'
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage })
      throw error
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'REGISTER_START' })
      
      console.log('Sending registration data:', userData)
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      console.log('Registration response status:', response.status)
      
      const data = await response.json()
      console.log('Registration response data:', data)
      
      if (!response.ok) {
        if (data.errors) {
          console.error('Validation errors:', data.errors)
          const errorMessage = data.errors.map(e => e.msg).join(', ')
          throw new Error(errorMessage)
        }
        throw new Error(data.message || 'Registration failed')
      }
      
      localStorage.setItem('token', data.token)
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          user: data.user,
          token: data.token
        }
      })
      
      return { user: data.user, token: data.token }
    } catch (error) {
      console.error('Registration error in context:', error)
      const errorMessage = error.message || 'Registration failed'
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        const errorMsg = data.errors 
          ? data.errors.map(e => e.msg).join(', ')
          : data.message || 'Profile update failed'
        throw new Error(errorMsg)
      }
      
      dispatch({
        type: 'UPDATE_PROFILE',
        payload: data.user
      })
      
      return { user: data.user }
    } catch (error) {
      throw error
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    isClient: state.user && state.user.role === 'client',
    isMechanic: state.user && state.user.role === 'mechanic',
    isAdmin: state.user && state.user.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
