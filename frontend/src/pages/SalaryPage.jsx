import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchSalaryStructures } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Card, CardHeader, CardContent } from '../components/Card'
import { LoadingState } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'

export default function SalaryPage() {
  const { token } = useAuth()
  const [structures, setStructures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    fetchSalaryStructures(token).then(setStructures).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [token]) // Added token dependency
  
  if (loading) return <LoadingState />
  
  return (
    <>
      <PageHeader
        subtitle="Payroll configuration"
        title="Salary structures"
        description="Configure the rule-driven salary engine for each payroll structure."
        badge={<span className="count-chip">{structures.length} structures</span>}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Card>
        <CardHeader title="Salary structures" subtitle="Available templates" />
        <CardContent>
          <div className="selection-list">
            {structures.map((structure) => (
              <div key={structure._id} className="list-item">
                <strong>{structure.name}</strong>
                <span>{structure.code}</span>
                <small>{structure.description || 'No description'}</small>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
