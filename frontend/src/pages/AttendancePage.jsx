import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchAttendance, checkIn, checkOut } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table'
import { StatusBadge } from '../components/Badge'
import { LoadingState } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Alert } from '../components/Alert'
import { LogIn, LogOut } from 'lucide-react'

export default function AttendancePage() {
  const { token } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  useEffect(() => {
    loadAttendance()
  }, [token]) // Added token dependency
  
  async function loadAttendance() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAttendance(token)
      setAttendance(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleCheckIn() {
    setActionLoading(true)
    setError('')
    setMessage('')
    try {
      await checkIn(token)
      setMessage('Check-in recorded successfully')
      await loadAttendance()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }
  
  async function handleCheckOut() {
    setActionLoading(true)
    setError('')
    setMessage('')
    try {
      await checkOut(token)
      setMessage('Check-out recorded successfully')
      await loadAttendance()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }
  
  if (loading) return <LoadingState />
  
  return (
    <>
      <PageHeader
        subtitle="Daily time"
        title="Attendance"
        description="Check-ins, exceptions, and authorized corrections in one review queue."
        action={
          <>
            <Button onClick={handleCheckIn} disabled={actionLoading} size="small">
              <LogIn size={16} style={{ marginRight: '0.5rem' }} />
              Check in
            </Button>
            <Button onClick={handleCheckOut} disabled={actionLoading} size="small">
              <LogOut size={16} style={{ marginRight: '0.5rem' }} />
              Check out
            </Button>
          </>
        }
      />
      
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Date</TableHeader>
            <TableHeader>Employee</TableHeader>
            <TableHeader>Check in</TableHeader>
            <TableHeader>Check out</TableHeader>
            <TableHeader>Worked</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendance.map((entry) => (
            <TableRow key={entry._id}>
              <TableCell>{new Date(entry.workDate).toLocaleDateString()}</TableCell>
              <TableCell>{entry.employeeId?.firstName} {entry.employeeId?.lastName}</TableCell>
              <TableCell>
                {entry.checkIn ? new Date(entry.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
              </TableCell>
              <TableCell>
                {entry.checkOut ? new Date(entry.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
              </TableCell>
              <TableCell>{entry.workedHours} hrs</TableCell>
              <TableCell><StatusBadge status={entry.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {attendance.length === 0 && (
        <EmptyState message="No attendance records yet" />
      )}
    </>
  )
}
