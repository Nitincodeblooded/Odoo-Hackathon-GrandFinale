import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchPayrun, computePayrun, validatePayrun, markPayrunPaid, sendPayrunPayslips } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table'
import { StatusBadge } from '../components/Badge'
import { LoadingState, LoadingSpinner } from '../components/LoadingSpinner'
import { Alert } from '../components/Alert'
import { Card, CardHeader, CardContent } from '../components/Card'
import { Modal } from '../components/Modal'
import { ArrowLeft, Calculator, CheckCircle, DollarSign, Send, AlertTriangle } from 'lucide-react'

export default function PayrunDetailPage() {
  const { payrunId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(null)
  
  useEffect(() => {
    loadData()
  }, [payrunId, token]) // Added token dependency
  
  const loadData = () => {
    setLoading(true)
    fetchPayrun(token, payrunId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  
  const handleCompute = async () => {
    setActionLoading('compute')
    setActionError('')
    setActionSuccess('')
    try {
      const result = await computePayrun(token, payrunId)
      setData({ ...data, payrun: result.payrun })
      setActionSuccess('Payrun computed successfully')
      // Reload to get updated payslips
      setTimeout(loadData, 500)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(null)
    }
  }
  
  const handleValidate = async () => {
    setShowConfirmModal(null)
    setActionLoading('validate')
    setActionError('')
    setActionSuccess('')
    try {
      const result = await validatePayrun(token, payrunId)
      setData({ ...data, payrun: result.payrun })
      setActionSuccess('Payrun validated successfully')
      setTimeout(loadData, 500)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(null)
    }
  }
  
  const handleMarkPaid = async () => {
    setShowConfirmModal(null)
    setActionLoading('paid')
    setActionError('')
    setActionSuccess('')
    try {
      const result = await markPayrunPaid(token, payrunId)
      setData({ ...data, payrun: result.payrun })
      setActionSuccess('Payrun marked as paid')
      setTimeout(loadData, 500)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(null)
    }
  }
  
  const handleSendPayslips = async () => {
    setShowConfirmModal(null)
    setActionLoading('send')
    setActionError('')
    setActionSuccess('')
    try {
      const result = await sendPayrunPayslips(token, payrunId)
      setData({ ...data, payrun: result.payrun })
      if (result.failedCount > 0) {
        setActionError(`Sent ${result.sentCount} payslips, ${result.failedCount} failed`)
      } else {
        setActionSuccess(`All ${result.sentCount} payslips sent successfully`)
      }
      setTimeout(loadData, 500)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(null)
    }
  }
  
  if (loading) return <LoadingState />
  if (error) return <Alert variant="error">{error}</Alert>
  if (!data) return null
  
  const { payrun, payslips } = data
  const hasWarnings = payrun.warnings && payrun.warnings.length > 0
  
  return (
    <>
      <Button variant="ghost" onClick={() => navigate('/payroll')} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
        Back to payruns
      </Button>
      
      <PageHeader
        subtitle="Payslip batch"
        title={payrun.name}
        description={`${new Date(payrun.periodStart).toLocaleDateString()} - ${new Date(payrun.periodEnd).toLocaleDateString()}`}
        badge={<StatusBadge status={payrun.status} />}
      />
      
      {actionSuccess && <Alert variant="success" style={{ marginBottom: '1rem' }}>{actionSuccess}</Alert>}
      {actionError && <Alert variant="error" style={{ marginBottom: '1rem' }}>{actionError}</Alert>}
      
      {hasWarnings && (
        <Alert variant="warning" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertTriangle size={16} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
            <div>
              <strong>Warnings detected:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
                {payrun.warnings.slice(0, 5).map((w, i) => (
                  <li key={i} style={{ fontSize: '0.9rem' }}>{w}</li>
                ))}
                {payrun.warnings.length > 5 && (
                  <li style={{ fontSize: '0.9rem' }}>...and {payrun.warnings.length - 5} more warnings</li>
                )}
              </ul>
            </div>
          </div>
        </Alert>
      )}
      
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardHeader>
          <h3 style={{ margin: 0 }}>Payrun Summary</h3>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Employees</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{payrun.employeeCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Gross</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                ${(payrun.totalGross || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Net</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                ${(payrun.totalNet || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Payslips</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{payslips.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardHeader>
          <h3 style={{ margin: 0 }}>Actions</h3>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {payrun.status === 'draft' && (
              <Button onClick={handleCompute} disabled={actionLoading === 'compute'}>
                {actionLoading === 'compute' ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <Calculator size={16} style={{ marginRight: '0.5rem' }} />
                    Compute Payslips
                  </>
                )}
              </Button>
            )}
            
            {payrun.status === 'computed' && (
              <Button onClick={() => setShowConfirmModal('validate')} disabled={actionLoading === 'validate' || hasWarnings}>
                {actionLoading === 'validate' ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                    Validate Payrun
                  </>
                )}
              </Button>
            )}
            
            {payrun.status === 'validated' && (
              <Button onClick={() => setShowConfirmModal('paid')} disabled={actionLoading === 'paid'}>
                {actionLoading === 'paid' ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <DollarSign size={16} style={{ marginRight: '0.5rem' }} />
                    Mark as Paid
                  </>
                )}
              </Button>
            )}
            
            {payrun.status === 'paid' && (
              <Button onClick={() => setShowConfirmModal('send')} disabled={actionLoading === 'send'}>
                {actionLoading === 'send' ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <Send size={16} style={{ marginRight: '0.5rem' }} />
                    Send Payslips
                  </>
                )}
              </Button>
            )}
            
            {payrun.status === 'computed' && (
              <Button variant="secondary" onClick={handleCompute} disabled={actionLoading === 'compute'}>
                {actionLoading === 'compute' ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <Calculator size={16} style={{ marginRight: '0.5rem' }} />
                    Re-compute
                  </>
                )}
              </Button>
            )}
          </div>
          
          {payrun.status === 'computed' && hasWarnings && (
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.9rem', color: '#d97706' }}>
              ⚠ Resolve all warnings before validating the payrun
            </p>
          )}
        </CardContent>
      </Card>
      
      <h3 style={{ marginBottom: '1rem' }}>Payslips ({payslips.length})</h3>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Employee</TableHeader>
            <TableHeader>Department</TableHeader>
            <TableHeader>Worked Days</TableHeader>
            <TableHeader>Gross</TableHeader>
            <TableHeader>Net</TableHeader>
            <TableHeader>Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {payslips.map((payslip) => (
            <TableRow key={payslip._id} onClick={() => navigate(`/payslips/${payslip._id}`)}>
              <TableCell>{payslip.employeeSnapshot?.name || 'Unknown'}</TableCell>
              <TableCell>{payslip.employeeSnapshot?.department || '-'}</TableCell>
              <TableCell>{payslip.workedDays || 0}</TableCell>
              <TableCell>${payslip.grossAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</TableCell>
              <TableCell>${payslip.netAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</TableCell>
              <TableCell><StatusBadge status={payslip.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {showConfirmModal && (
        <Modal onClose={() => setShowConfirmModal(null)} size="small">
          <div style={{ padding: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Confirm Action</h3>
            {showConfirmModal === 'validate' && (
              <>
                <p>Are you sure you want to validate this payrun? This will lock the payslips and prevent further modifications.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <Button variant="secondary" onClick={() => setShowConfirmModal(null)}>Cancel</Button>
                  <Button onClick={handleValidate}>Validate Payrun</Button>
                </div>
              </>
            )}
            {showConfirmModal === 'paid' && (
              <>
                <p>Mark this payrun as paid? This indicates that payments have been processed through your payroll system.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <Button variant="secondary" onClick={() => setShowConfirmModal(null)}>Cancel</Button>
                  <Button onClick={handleMarkPaid}>Mark as Paid</Button>
                </div>
              </>
            )}
            {showConfirmModal === 'send' && (
              <>
                <p>Send payslip emails to all {payslips.length} employees? Make sure email configuration is properly set up.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <Button variant="secondary" onClick={() => setShowConfirmModal(null)}>Cancel</Button>
                  <Button onClick={handleSendPayslips}>Send Payslips</Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
