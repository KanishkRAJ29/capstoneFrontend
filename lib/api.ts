import axios from "axios"

// Create axios instance with base URL
export const api = axios.create({
  baseURL: /*process.env.NEXT_PUBLIC_API_URL ||*/ "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})
console.log("📡 API baseURL is:", api.defaults.baseURL)
// Add request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor to handle token expiration and log errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}: ${error.response.config.url}`, error.response.data)

      if (error.response.status === 404) {
        console.error("404 Not Found: The requested endpoint does not exist")
      }

      if (error.response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    } else if (error.request) {
      console.error("API Error: No response received", error.request)
    } else {
      console.error("API Error:", error.message)
    }
    return Promise.reject(error)
  },
)

// Helper fun ction to check API health
export const checkApiHealth = async () => {
  try {
    const response = await api.get("/api/health")
    return response.data.status === "ok"
  } catch (error) {
    console.error("API Health Check Failed:", error)
    return false
  }
}
