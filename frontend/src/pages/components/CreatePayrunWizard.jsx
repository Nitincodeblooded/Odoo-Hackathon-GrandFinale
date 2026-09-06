import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { fetchSalaryStructures, previewPayrun, createPayrun } from '../../services/api'
import { Modal } from '../../components/Modal'
import { Button } from '../../components/Button'
import { Input, Select } from '../../components/Input'
import { Alert } from '../../components/Alert'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { AlertCircle, ChevronRight, ChevronLeft, Check } from 'lucide-react'

export default function CreatePayrunWizard({ onClose, onSuccess }) {
  const { token } = useAuth()
  const [step, setStep] = useState(1)
  
  // Step 1: Structure and period
  const [structures, setStructures] = useState([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    salaryStructureId: '',
    periodStart: '',
    periodEnd: ''
  })
  
  // Step 2: Employee selection
  const [preview, setPreview] = useState(null)
  const [selectedEmployees, setSelectedEmployees] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState([])
  
  useEffect(() => {
    fetchSalaryStructures(token)
      .then(data => setStructures(data))
      .catch(err => setError(err.message))
  }, [token]) // Added token dependency
  
  const handleStep1Next = async () => {
    setError('')
    setWarnings([])
    
    if (!formData.code || !formData.name || !formData.salaryStructureId || !formData.periodStart || !formData.periodEnd) {
      setError('All fields are required')
      return
    }
    
    setLoading(true)
    try {
      const previewData = await previewPayrun(token, {
        salaryStructureId: formData.salaryStructureId,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd
      })
      setPreview(previewData)
      
      // Pre-select all eligible employees
      const eligibleIds = previewData.eligibleEmployees.map(e => e.employee._id)
      setSelectedEmployees(eligibleIds)
      
      // Collect warnings
      const allWarnings = []
      previewData.eligibleEmployees.forEach(e => {
        if (e.warnings && e.warnings.length > 0) {
          allWarnings.push(`${e.employee.employeeNumber}: ${e.warnings.join(', ')}`)
        }
      })
      if (allWarnings.length > 0) {
        setWarnings(allWarnings)
      }
      
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreatePayrun = async () => {
    setError('')
    
    if (selectedEmployees.length === 0) {
      setError('Select at least one employee')
      return
    }
    
    setLoading(true)
    try {
      const result = await createPayrun(token, {
        ...formData,
        employeeIds: selectedEmployees
      })
      onSuccess(result.payrun)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const toggleEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }
  
  const toggleAll = () => {
    if (selectedEmployees.length === preview.eligibleEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(preview.eligibleEmployees.map(e => e.employee._id))
    }
  }
  
  return (
    <Modal onClose={onClose} size="large">
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Create New Payrun</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {step === 1 ? 'Step 1 of 2: Configure period and structure' : 'Step 2 of 2: Select employees'}
        </p>
        
        {error && <Alert variant="error" style={{ marginBottom: '1rem' }}>{error}</Alert>}
        {warnings.length > 0 && (
          <Alert variant="warning" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ marginTop: '0.2rem', flexShrink: 0 }} />
              <div>
                <strong>Data quality warnings:</strong>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
                  {warnings.slice(0, 5).map((w, i) => (
                    <li key={i} style={{ fontSize: '0.9rem' }}>{w}</li>
                  ))}
                  {warnings.length > 5 && <li style={{ fontSize: '0.9rem' }}>...and {warnings.length - 5} more</li>}
                </ul>
              </div>
            </div>
          </Alert>
        )}
        
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Payrun Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., PAY-2024-01"
              required
            />
            
            <Input
              label="Payrun Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., January 2024 Payroll"
              required
            />
            
            <Select
              label="Salary Structure"
              value={formData.salaryStructureId}
              onChange={(e) => setFormData({ ...formData, salaryStructureId: e.target.value })}
              required
            >
              <option value="">Select structure...</option>
              {structures.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </Select>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Period Start"
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                required
              />
              
              <Input
                label="Period End"
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                required
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={handleStep1Next} disabled={loading}>
                {loading ? <LoadingSpinner size="small" /> : (
                  <>
                    Next: Select employees
                    <ChevronRight size={16} style={{ marginLeft: '0.5rem' }} />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {step === 2 && preview && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span><strong>Eligible:</strong> {preview.eligibleEmployees.length}</span>
                <span><strong>Ineligible:</strong> {preview.ineligibleEmployees.length}</span>
                <span><strong>Selected:</strong> {selectedEmployees.length}</span>
              </div>
              {preview.ineligibleEmployees.length > 0 && (
                <details style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#666' }}>
                    View ineligible employees ({preview.ineligibleEmployees.length})
                  </summary>
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                    {preview.ineligibleEmployees.map((item, i) => (
                      <li key={i}>
                        {item.employee.employeeNumber} - {item.employee.firstName} {item.employee.lastName}: {item.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedEmployees.length === preview.eligibleEmployees.length}
                  onChange={toggleAll}
                />
                <strong>Select all eligible employees</strong>
              </label>
            </div>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px' }}>
              {preview.eligibleEmployees.map((item) => (
                <label
                  key={item.employee._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    background: selectedEmployees.includes(item.employee._id) ? '#f0f8f0' : 'white'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(item.employee._id)}
                    onChange={() => toggleEmployee(item.employee._id)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>
                      {item.employee.employeeNumber} - {item.employee.firstName} {item.employee.lastName}
                    </div>
                    {item.employee.department && (
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.employee.department}</div>
                    )}
                    {item.warnings && item.warnings.length > 0 && (
                      <div style={{ fontSize: '0.85rem', color: '#d97706', marginTop: '0.25rem' }}>
                        ⚠ {item.warnings.join(', ')}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    ${item.contract.wage.toLocaleString()}
                  </div>
                </label>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ChevronLeft size={16} style={{ marginRight: '0.5rem' }} />
                Back
              </Button>
              <Button onClick={handleCreatePayrun} disabled={loading || selectedEmployees.length === 0}>
                {loading ? <LoadingSpinner size="small" /> : (
                  <>
                    <Check size={16} style={{ marginRight: '0.5rem' }} />
                    Create Payrun
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
