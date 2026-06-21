import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import AIChatbot from './components/AIChatbot'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SearchResults from './pages/SearchResults'
import BookTrain from './pages/BookTrain'
import MyBookings from './pages/MyBookings'
import PNRStatus from './pages/PNRStatus'
import AdminPanel from './pages/AdminPanel'
import AIFeatures from './pages/AIFeatures'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null // wait for auth to load
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: "'Segoe UI', sans-serif", fontSize: 14, borderRadius: 8 },
          success: { iconTheme: { primary: '#16a34a', secondary: 'white' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: 'white' } },
        }}
      />
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />

        {/* Protected routes */}
        <Route path="/"          element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/search"    element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
        <Route path="/book/:id"  element={<ProtectedRoute><BookTrain /></ProtectedRoute>} />
        <Route path="/bookings"  element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/pnr"       element={<ProtectedRoute><PNRStatus /></ProtectedRoute>} />
        <Route path="/admin"     element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/ai"        element={<ProtectedRoute><AIFeatures /></ProtectedRoute>} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
      <AIChatbot />
    </AuthProvider>
  )
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🚂</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>404 — Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This page has left the station.</p>
      <a href="/" className="btn btn-primary">Back to Home</a>
    </div>
  )
}