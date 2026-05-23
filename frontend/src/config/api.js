const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  // Remove trailing slashes
  url = url.replace(/\/+$/, '')
  
  if (!url.endsWith('/api')) {
    url = `${url}/api`
  }
  return url
}

const API_BASE_URL = getApiBaseUrl()

export default API_BASE_URL

