import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const stored = localStorage.getItem('railride_user')
  if (stored) {
    const { token } = JSON.parse(stored)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response error handler
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('railride_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────
export const registerUser  = (data) => API.post('/auth/register', data)
export const loginUser     = (data) => API.post('/auth/login', data)
export const getMe         = ()     => API.get('/auth/me')
export const changePassword = (data) => API.put('/auth/change-password', data)

// ── Trains ────────────────────────────────
export const searchTrains  = (params) => API.get('/trains/search', { params })
export const getTrainById  = (id)     => API.get(`/trains/${id}`)
export const getAllTrains   = ()       => API.get('/trains')
export const createTrain   = (data)   => API.post('/trains', data)
export const updateTrain   = (id, d)  => API.put(`/trains/${id}`, d)
export const deleteTrain   = (id)     => API.delete(`/trains/${id}`)

// ── Bookings ──────────────────────────────
export const createBooking = (data) => API.post('/bookings', data)
export const getMyBookings = ()     => API.get('/bookings/my')
export const getByPNR      = (pnr)  => API.get(`/bookings/pnr/${pnr}`)
export const cancelBooking = (id)   => API.put(`/bookings/${id}/cancel`)

// ── AI ────────────────────────────────────
export const aiPlanTrip      = (query)  => API.post('/ai/plan', { query })
export const aiRecommendSeat = (data)   => API.post('/ai/recommend-seat', data)
export const aiChat          = (message, history) => API.post('/ai/chat', { message, history })
