import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('railride_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
      } catch {
        localStorage.removeItem('railride_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('railride_user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('railride_user')
    delete axios.defaults.headers.common['Authorization']
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
