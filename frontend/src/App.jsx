import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
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
        <Route path="/"          element={<Home />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/search"    element={<SearchResults />} />
        <Route path="/book/:id"  element={<BookTrain />} />
        <Route path="/bookings"  element={<MyBookings />} />
        <Route path="/pnr"       element={<PNRStatus />} />
        <Route path="/admin"     element={<AdminPanel />} />
        <Route path="/ai"        element={<AIFeatures />} />
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
