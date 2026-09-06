import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchEmployee } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Card, CardHeader, CardContent } from '../components/Card'
import { StatusBadge } from '../components/Badge'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { LoadingState } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { ArrowLeft } from 'lucide-react'

export default function EmployeeDetailPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    loadEmployee()
  }, [employeeId, token]) // Added dependencies
  
  async function loadEmployee() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchEmployee(token, employeeId)
      setEmployee(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <LoadingState />
  if (error) return <Alert variant="error">{error}</Alert>
  if (!employee) return null
  
  return (
    <>
      <Button variant="ghost" onClick={() => navigate('/employees')} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
        Back to employees
      </Button>
      
      <PageHeader
        subtitle="Employee record"
        title={`${employee.firstName} ${employee.lastName}`}
        description={`${employee.jobPosition || 'Position not assigned'} · ${employee.department || 'Department not assigned'}`}
        badge={<StatusBadge status={employee.status} />}
      />
      
      <section className="detail-grid">
        <Card>
          <CardHeader title="Profile" subtitle={employee.employeeNumber} />
          <CardContent>
            <dl className="detail-list">
              <div>
                <dt>Work email</dt>
                <dd>{employee.workEmail || 'Not assigned'}</dd>
              </div>
              <div>
                <dt>Manager</dt>
                <dd>{employee.managerId ? `${employee.managerId.firstName} ${employee.managerId.lastName}` : 'Not assigned'}</dd>
              </div>
              <div>
                <dt>Working schedule</dt>
                <dd>{employee.workingScheduleId?.name || 'Not assigned'}</dd>
              </div>
              <div>
                <dt>Employee type</dt>
                <dd>{employee.employeeType.replace('_', ' ')}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader title="Related records" subtitle="Operational hub" />
          <CardContent>
            <div className="smart-grid">
              {Object.entries(employee.relatedCounts || {}).map(([key, value]) => (
                <div key={key}>
                  <strong>{value}</strong>
                  <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
