import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { login as loginApi, registerAccount } from '../services/api'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Alert } from '../components/Alert'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    department: '',
    jobPosition: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = mode === 'login'
        ? await loginApi(email, password)
        : await registerAccount({ email, password, ...form })
      
      login(result.token, result.user)
      navigate(result.user.role === 'employee' ? '/employees' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const updateField = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  
  return (
    <main className="login-layout">
      <section className="login-intro">
        <p className="eyebrow">PeoplePay360 · HR operations</p>
        <h1>{mode === 'login' ? 'Work, paid properly.' : 'Your work, connected.'}</h1>
        <p className="lede">
          The connected workspace for people, time, leave, and payroll.
        </p>
      </section>
      
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="section-kicker">Secure workspace</span>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p>
          {mode === 'login'
            ? 'Sign in to continue to your operational dashboard.'
            : 'Create an Employee account to get started.'}
        </p>
        
        {mode === 'signup' && (
          <div className="signup-grid">
            <Input
              label="Employee number"
              required
              value={form.employeeNumber}
              onChange={updateField('employeeNumber')}
              placeholder="EMP-001"
            />
            <Input
              label="First name"
              required
              value={form.firstName}
              onChange={updateField('firstName')}
            />
            <Input
              label="Last name"
              required
              value={form.lastName}
              onChange={updateField('lastName')}
            />
            <Input
              label="Department (optional)"
              value={form.department}
              onChange={updateField('department')}
            />
            <Input
              label="Job position (optional)"
              value={form.jobPosition}
              onChange={updateField('jobPosition')}
              className="signup-grid-span-2"
            />
          </div>
        )}
        
        <Input
          label="Work email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <Input
          label="Password"
          type="password"
          minLength="8"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {error && (
          <Alert variant="error">{error}</Alert>
        )}
        
        <Button type="submit" disabled={loading}>
          {loading
            ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
            : (mode === 'login' ? 'Sign in' : 'Create account')}
        </Button>
        
        <button
          type="button"
          className="mode-switch"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError('')
          }}
        >
          {mode === 'login'
            ? 'New here? Create an account'
            : 'Already have an account? Sign in'}
        </button>
        
        {mode === 'login' && (
          <small>
            Employee accounts can be created here. Elevated roles are assigned by an administrator.
          </small>
        )}
      </form>
    </main>
  )
}
