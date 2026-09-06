import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { LoadingState } from './components/LoadingSpinner'

// Page imports will be added as we create them
// For now, we'll import from a pages directory we'll create

// Lazy load pages for better performance
import { lazy, Suspense } from 'react'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'))
const EmployeeDetailPage = lazy(() => import('./pages/EmployeeDetailPage'))
const ContractsPage = lazy(() => import('./pages/ContractsPage'))
const AttendancePage = lazy(() => import('./pages/AttendancePage'))
const TimeOffPage = lazy(() => import('./pages/TimeOffPage'))
const SalaryPage = lazy(() => import('./pages/SalaryPage'))
const PayrollPage = lazy(() => import('./pages/PayrollPage'))
const PayrunDetailPage = lazy(() => import('./pages/PayrunDetailPage'))
const PayslipDetailPage = lazy(() => import('./pages/PayslipDetailPage'))

function AppRoutes() {
  const { user, logout } = useAuth()
  
  const hrRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']
  const payrollRoles = ['hr_payroll_user', 'hr_payroll_manager', 'admin']
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingState />}>
              <DashboardPage />
            </Suspense>
          }
        />
        
        <Route
          path="/employees"
          element={
            <Suspense fallback={<LoadingState />}>
              <EmployeesPage />
            </Suspense>
          }
        />
        
        <Route
          path="/employees/:employeeId"
          element={
            <Suspense fallback={<LoadingState />}>
              <EmployeeDetailPage />
            </Suspense>
          }
        />
        
        <Route
          path="/contracts"
          element={
            <ProtectedRoute requiredRoles={hrRoles}>
              <Suspense fallback={<LoadingState />}>
                <ContractsPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/attendance"
          element={
            <Suspense fallback={<LoadingState />}>
              <AttendancePage />
            </Suspense>
          }
        />
        
        <Route
          path="/time-off"
          element={
            <Suspense fallback={<LoadingState />}>
              <TimeOffPage />
            </Suspense>
          }
        />
        
        <Route
          path="/salary"
          element={
            <ProtectedRoute requiredRoles={payrollRoles}>
              <Suspense fallback={<LoadingState />}>
                <SalaryPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/payroll"
          element={
            <ProtectedRoute requiredRoles={payrollRoles}>
              <Suspense fallback={<LoadingState />}>
                <PayrollPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/payroll/:payrunId"
          element={
            <ProtectedRoute requiredRoles={payrollRoles}>
              <Suspense fallback={<LoadingState />}>
                <PayrunDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/payslips/:payslipId"
          element={
            <ProtectedRoute requiredRoles={payrollRoles}>
              <Suspense fallback={<LoadingState />}>
                <PayslipDetailPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
