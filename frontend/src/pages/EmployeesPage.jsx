import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { fetchEmployees, createEmployee } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { Button } from '../components/Button'
import { SearchBar } from '../components/SearchBar'
import { Avatar } from '../components/Avatar'
import { StatusBadge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { Input, Select } from '../components/Input'
import { LoadingState } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Alert } from '../components/Alert'
import { LayoutGrid, List as ListIcon, Plus } from 'lucide-react'

const hrManagementRoles = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin']

export default function EmployeesPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    workEmail: '',
    department: '',
    jobPosition: '',
    employeeType: 'full_time',
  })
  const [creating, setCreating] = useState(false)
  
  const canManage = hrManagementRoles.includes(user?.role)
  
  useEffect(() => {
    loadEmployees()
  }, [token]) // Added token dependency
  
  async function loadEmployees() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchEmployees(token)
      setEmployees(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleCreateEmployee(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await createEmployee(token, createForm)
      setShowCreateModal(false)
      setCreateForm({
        employeeNumber: '',
        firstName: '',
        lastName: '',
        workEmail: '',
        department: '',
        jobPosition: '',
        employeeType: 'full_time',
      })
      await loadEmployees()
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }
  
  const filtered = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName} ${emp.employeeNumber} ${emp.department || ''}`.toLowerCase().includes(search.toLowerCase())
  )
  
  if (loading) return <LoadingState />
  
  return (
    <>
      <PageHeader
        subtitle="People directory"
        title="Employees"
        description="Your people records are the hub for every HR workflow."
        badge={<span className="count-chip">{employees.length} records</span>}
        action={
          <>
            {canManage && (
              <Button onClick={() => setShowCreateModal(true)} size="small">
                <Plus size={16} style={{ marginRight: '0.5rem' }} />
                New Employee
              </Button>
            )}
            <Button
              variant="secondary"
              size="small"
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            >
              {view === 'grid' ? <ListIcon size={16} /> : <LayoutGrid size={16} />}
            </Button>
          </>
        }
      />
      
      {error && <Alert variant="error">{error}</Alert>}
      
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, number, or department"
        />
      </div>
      
      {view === 'grid' ? (
        <section className="employee-grid">
          {filtered.map((emp) => (
            <button
              key={emp._id}
              className="employee-card employee-card-button"
              onClick={() => navigate(`/employees/${emp._id}`)}
            >
              <Avatar firstName={emp.firstName} lastName={emp.lastName} />
              <div>
                <h2>{emp.firstName} {emp.lastName}</h2>
                <p>{emp.jobPosition || 'Position not assigned'}</p>
                <StatusBadge status={emp.status} />
              </div>
              <dl>
                <div>
                  <dt>Department</dt>
                  <dd>{emp.department || 'Unassigned'}</dd>
                </div>
                <div>
                  <dt>Employee no.</dt>
                  <dd>{emp.employeeNumber}</dd>
                </div>
                <div>
                  <dt>Schedule</dt>
                  <dd>{emp.workingScheduleId?.name || 'Unassigned'}</dd>
                </div>
              </dl>
              <span className="card-arrow">View record →</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <EmptyState message="No employee records match this search" />
          )}
        </section>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Number</th>
                <th>Department</th>
                <th>Position</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr
                  key={emp._id}
                  onClick={() => navigate(`/employees/${emp._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Avatar firstName={emp.firstName} lastName={emp.lastName} size="small" />
                      <span>{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>
                  <td>{emp.employeeNumber}</td>
                  <td>{emp.department || '-'}</td>
                  <td>{emp.jobPosition || '-'}</td>
                  <td>{emp.employeeType.replace('_', ' ')}</td>
                  <td><StatusBadge status={emp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState message="No employee records match this search" />
          )}
        </div>
      )}
      
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Employee"
        size="large"
      >
        <form onSubmit={handleCreateEmployee}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Employee Number"
              required
              value={createForm.employeeNumber}
              onChange={(e) => setCreateForm({ ...createForm, employeeNumber: e.target.value })}
            />
            <Select
              label="Employee Type"
              value={createForm.employeeType}
              onChange={(e) => setCreateForm({ ...createForm, employeeType: e.target.value })}
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contractor">Contractor</option>
              <option value="intern">Intern</option>
            </Select>
            <Input
              label="First Name"
              required
              value={createForm.firstName}
              onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={createForm.lastName}
              onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
            />
            <Input
              label="Work Email"
              type="email"
              value={createForm.workEmail}
              onChange={(e) => setCreateForm({ ...createForm, workEmail: e.target.value })}
            />
            <Input
              label="Department"
              value={createForm.department}
              onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
            />
            <Input
              label="Job Position"
              value={createForm.jobPosition}
              onChange={(e) => setCreateForm({ ...createForm, jobPosition: e.target.value })}
              style={{ gridColumn: 'span 2' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
