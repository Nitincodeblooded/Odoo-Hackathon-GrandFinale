import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchContracts } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Card, CardHeader, CardContent } from '../components/Card'
import { StatusBadge } from '../components/Badge'
import { LoadingState } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'

export default function ContractsPage() {
  const { token } = useAuth()
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    fetchContracts(token).then(setContracts).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [token]) // Added token dependency
  
  if (loading) return <LoadingState />
  
  return (
    <>
      <PageHeader
        subtitle="Contract records"
        title="Contracts & schedules"
        description="Track active terms, schedule assignments, and payroll-ready contract history."
        badge={<span className="count-chip">{contracts.length} active records</span>}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Card>
        <CardHeader title="Contract list" subtitle={`${contracts.length} terms`} />
        <CardContent>
          <div className="selection-list">
            {contracts.map((contract) => (
              <div key={contract._id} className="list-item">
                <strong>{contract.title}</strong>
                <span>{contract.employeeId?.firstName} {contract.employeeId?.lastName}</span>
                <small>{new Date(contract.startDate).toLocaleDateString()} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Open ended'}</small>
                <small><StatusBadge status={contract.status} /> · ${Number(contract.wage).toLocaleString()} {contract.currency}</small>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
