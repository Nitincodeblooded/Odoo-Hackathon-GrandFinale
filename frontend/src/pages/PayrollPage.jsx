import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchPayruns } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/Badge'
import { LoadingState } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Alert } from '../components/Alert'
import { Plus } from 'lucide-react'
import CreatePayrunWizard from './components/CreatePayrunWizard'

export default function PayrollPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [payruns, setPayruns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWizard, setShowWizard] = useState(false)
  
  useEffect(() => {
    fetchPayruns(token).then(setPayruns).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [token]) // Added token dependency
  
  const handlePayrunCreated = (newPayrun) => {
    setShowWizard(false)
    setPayruns([newPayrun, ...payruns])
    navigate(`/payroll/${newPayrun._id}`)
  }
  
  if (loading) return <LoadingState />
  
  return (
    <>
      <PageHeader
        subtitle="Payrun operations"
        title="Payroll"
        description="Configure a period, select eligible people, then process the batch."
        action={
          <Button size="small" onClick={() => setShowWizard(true)}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            New payrun
          </Button>
        }
      />
      {error && <Alert variant="error">{error}</Alert>}
      
      <section className="payrun-list">
        {payruns.map((payrun) => (
          <button key={payrun._id} onClick={() => navigate(`/payroll/${payrun._id}`)}>
            <div>
              <strong>{payrun.name}</strong>
              <span>{new Date(payrun.periodStart).toLocaleDateString()} - {new Date(payrun.periodEnd).toLocaleDateString()}</span>
            </div>
            <StatusBadge status={payrun.status} />
          </button>
        ))}
        {payruns.length === 0 && <EmptyState message="No payruns created yet" />}
      </section>
      
      {showWizard && (
        <CreatePayrunWizard 
          onClose={() => setShowWizard(false)}
          onSuccess={handlePayrunCreated}
        />
      )}
    </>
  )
}
