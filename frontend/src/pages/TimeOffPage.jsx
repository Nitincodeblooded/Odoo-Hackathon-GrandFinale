import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchTimeOffRequests, fetchTimeOffAllocations, fetchTimeOffTypes } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Card, CardHeader, CardContent } from '../components/Card'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table'
import { StatusBadge } from '../components/Badge'
import { LoadingState } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'

export default function TimeOffPage() {
  const { token } = useAuth()
  const [requests, setRequests] = useState([])
  const [allocations, setAllocations] = useState([])
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    Promise.all([
      fetchTimeOffRequests(token).then(setRequests),
      fetchTimeOffAllocations(token).then(setAllocations),
      fetchTimeOffTypes(token).then(setTypes),
    ]).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [token]) // Added token dependency
  
  if (loading) return <LoadingState />
  
  return (
    <>
      <PageHeader
        subtitle="Leave operations"
        title="Time off"
        description="Submit requests, track balances, and maintain payroll-safe approvals."
        badge={<span className="count-chip">{requests.length} requests</span>}
      />
      {error && <Alert variant="error">{error}</Alert>}
      
      <section className="dashboard-grid">
        <Card>
          <CardHeader title="Balance overview" subtitle={`${allocations.length} allocations`} />
          <CardContent>
            <div className="selection-list">
              {allocations.map((allocation) => (
                <div key={allocation._id} className="list-item">
                  <strong>{allocation.timeOffTypeId?.name || 'Leave type'}</strong>
                  <span>{allocation.employeeId?.firstName} {allocation.employeeId?.lastName}</span>
                  <small>Remaining: {Math.max(0, (allocation.allocatedAmount || 0) - (allocation.usedAmount || 0))}</small>
                  <small><StatusBadge status={allocation.status} /></small>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Employee</TableHeader>
            <TableHeader>Policy</TableHeader>
            <TableHeader>Period</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request._id}>
              <TableCell>{request.employeeId?.firstName || ''} {request.employeeId?.lastName || ''}</TableCell>
              <TableCell>{request.timeOffTypeId?.name || 'Type'}</TableCell>
              <TableCell>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</TableCell>
              <TableCell>{request.requestedAmount}</TableCell>
              <TableCell><StatusBadge status={request.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
