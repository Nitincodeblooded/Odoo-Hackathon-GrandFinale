import { createContext, useContext, useState, useEffect } from 'react'
import { fetchCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('peoplepay360_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    
    fetchCurrentUser(token)
      .then((result) => {
        setUser(result.user)
      })
      .catch(() => {
        localStorage.removeItem('peoplepay360_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])
  
  const login = (newToken, newUser) => {
    localStorage.setItem('peoplepay360_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }
  
  const logout = () => {
    localStorage.removeItem('peoplepay360_token')
    setToken(null)
    setUser(null)
  }
  
  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
