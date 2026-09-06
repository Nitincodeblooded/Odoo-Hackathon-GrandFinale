import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingState } from './LoadingSpinner'

export function ProtectedRoute({ children, requiredRoles }) {
  const { token, user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="centered-state">
        <LoadingState />
      </div>
    )
  }
  
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="centered-state">
        <div className="empty-state">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }
  
  return children
}
