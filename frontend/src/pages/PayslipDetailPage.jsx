import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchPayslipDetail } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Card, CardHeader, CardContent } from '../components/Card'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table'
import { StatusBadge } from '../components/Badge'
import { LoadingState } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { ArrowLeft, Download } from 'lucide-react'

export default function PayslipDetailPage() {
  const { payslipId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    fetchPayslipDetail(token, payslipId).then(setData).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [payslipId, token]) // Added token dependency
  
  if (loading) return <LoadingState />
  if (error) return <Alert variant="error">{error}</Alert>
  if (!data) return null
  
  const { payslip, lines } = data
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  
  return (
    <>
      <Button variant="ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
        Back
      </Button>
      
      <PageHeader
        subtitle="Payslip detail"
        title={payslip.employeeSnapshot?.name || 'Payslip'}
        description={`${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(payslip.periodEnd).toLocaleDateString()}`}
        badge={<StatusBadge status={payslip.status} />}
        action={
          <Button
            size="small"
            onClick={() => window.open(`${apiUrl}/payslips/${payslipId}/pdf`, '_blank')}
          >
            <Download size={16} style={{ marginRight: '0.5rem' }} />
            Download PDF
          </Button>
        }
      />
      
      <Card>
        <CardHeader title="Salary computation" subtitle="Line items" />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Code</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line._id}>
                  <TableCell>{line.code}</TableCell>
                  <TableCell>{line.name}</TableCell>
                  <TableCell>{line.category}</TableCell>
                  <TableCell>${line.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3}><strong>Gross Amount</strong></TableCell>
                <TableCell><strong>${payslip.grossAmount.toLocaleString()}</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3}><strong>Net Amount</strong></TableCell>
                <TableCell><strong>${payslip.netAmount.toLocaleString()}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
