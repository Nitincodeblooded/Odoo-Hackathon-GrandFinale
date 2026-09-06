import { useEffect, useState } from 'react'
import {
  calculateSalaryStructure,
  checkIn,
  checkOut,
  computePayrun,
  createSalaryRule,
  createSalaryStructure,
  createContract,
  createPayrun,
  createSchedule,
  approveTimeOffRequest,
  createTimeOffRequest,
  fetchAttendance,
  fetchContracts,
  fetchCurrentUser,
  fetchDashboard,
  fetchEmployee,
  fetchEmployees,
  fetchPayrun,
  fetchPayruns,
  fetchSalaryRules,
  fetchSalaryStructures,
  fetchSchedules,
  fetchTimeOffAllocations,
  fetchTimeOffRequests,
  fetchTimeOffTypes,
  login,
  markPayrunPaid,
  previewPayrun,
  registerAccount,
  refuseTimeOffRequest,
  sendPayrunPayslips,
  validatePayrun,
} from './services/api'

const navigation = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'employees', label: 'Employees' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'time-off', label: 'Time off' },
  { id: 'salary', label: 'Salary' },
  { id: 'payroll', label: 'Payroll' },
]

function LoadingState() {
  return <div className="loading-state"><span className="spinner" />Loading live records...</div>
}

function EmptyState({ children }) {
  return <p className="empty-state">{children}</p>
}

function ErrorState({ message }) {
  return <p className="notice error">{message}</p>
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState({ employeeNumber: '', firstName: '', lastName: '', department: '', jobPosition: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = mode === 'login'
        ? await login(email, password)
        : await registerAccount({ email, password, ...form })
      onLogin(result)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field) => (event) => setForm({ ...form, [field]: event.target.value })
  return <main className="login-layout"><section className="login-intro"><p className="eyebrow">PeoplePay360 · HR operations</p><h1>{mode === 'login' ? 'Work, paid properly.' : 'Your work, connected.'}</h1><p className="lede">The connected workspace for people, time, leave, and payroll.</p></section><form className="login-card" onSubmit={submit}><span className="section-kicker">Secure workspace</span><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Sign in to continue to your operational dashboard.' : 'Create an Employee account to get started.'}</p>{mode === 'signup' && <div className="signup-grid"><label htmlFor="employee-number">Employee number</label><input id="employee-number" required value={form.employeeNumber} onChange={updateField('employeeNumber')} placeholder="EMP-001" /><label htmlFor="first-name">First name</label><input id="first-name" required value={form.firstName} onChange={updateField('firstName')} /><label htmlFor="last-name">Last name</label><input id="last-name" required value={form.lastName} onChange={updateField('lastName')} /><label htmlFor="department">Department <span>(optional)</span></label><input id="department" value={form.department} onChange={updateField('department')} /><label htmlFor="job-position">Job position <span>(optional)</span></label><input id="job-position" value={form.jobPosition} onChange={updateField('jobPosition')} /></div>}<label htmlFor="email">Work email</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /><label htmlFor="password">Password</label><input id="password" type="password" minLength="8" required value={password} onChange={(event) => setPassword(event.target.value)} />{error && <ErrorState message={error} />}<button className="primary-button" disabled={loading}>{loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign in' : 'Create account')}</button><button type="button" className="mode-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>{mode === 'login' && <small>Employee accounts can be created here. Elevated roles are assigned by an administrator.</small>}</form></main>
}

function DashboardView({ dashboard }) {
  const kpis = dashboard.kpis
  const maxSalary = Math.max(...dashboard.charts.salaryByDepartment.map((item) => item.amount), 1)
  return <><div className="view-heading"><div><span className="section-kicker">Live overview</span><h1>Payroll control room</h1><p>Real-time signals across people, attendance, leave, and paid salary.</p></div><span className="date-chip">{new Date(dashboard.filters.periodStart).toLocaleDateString()} - {new Date(dashboard.filters.periodEnd).toLocaleDateString()}</span></div><section className="kpi-grid">{[['Net salary paid', `$${kpis.totalNetSalaryPaid.toLocaleString()}`], ['Payslips generated', kpis.payslipsGenerated], ['Average salary', `$${kpis.averageSalary.toLocaleString()}`], ['Approved time off', kpis.approvedTimeOff], ['Attendance health', `${kpis.attendanceHealth}%`]].map(([label, value]) => <article className="kpi-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section><section className="dashboard-grid"><article className="dashboard-panel"><div className="panel-heading"><h2>Salary cost by department</h2><span>Paid net salary</span></div>{dashboard.charts.salaryByDepartment.length ? dashboard.charts.salaryByDepartment.map((item) => <div className="bar-row" key={item.department}><span>{item.department}</span><div className="bar-track"><i style={{ width: `${item.amount / maxSalary * 100}%` }} /></div><b>${item.amount.toLocaleString()}</b></div>) : <EmptyState>No paid salary data for this period.</EmptyState>}</article><article className="dashboard-panel"><div className="panel-heading"><h2>Monthly net trend</h2><span>Paid net salary</span></div>{dashboard.charts.monthlyNetSalary.length ? <div className="trend-list">{dashboard.charts.monthlyNetSalary.map((item) => <div key={item.month}><span>{item.month}</span><b>${item.amount.toLocaleString()}</b></div>)}</div> : <EmptyState>No monthly salary data for this period.</EmptyState>}</article></section><section className="dashboard-panel alerts-panel"><div className="panel-heading"><h2>Operational alerts</h2><span>{dashboard.alerts.length} live signals</span></div>{dashboard.alerts.slice(0, 8).map((alert, index) => <div className="alert-row" key={`${alert.type}-${index}`}><span className={`alert-dot alert-${alert.severity}`} /><span>{alert.message}</span><small>{alert.type.replaceAll('_', ' ')}</small></div>)}{!dashboard.alerts.length && <EmptyState>No operational alerts.</EmptyState>}</section></>
}

function EmployeesView({ employees, onSelect }) {
  const [search, setSearch] = useState('')
  const visible = employees.filter((employee) => `${employee.firstName} ${employee.lastName} ${employee.employeeNumber} ${employee.department || ''}`.toLowerCase().includes(search.toLowerCase()))
  return <><div className="view-heading"><div><span className="section-kicker">People directory</span><h1>Employees</h1><p>Your people records are the hub for every HR workflow.</p></div><span className="count-chip">{employees.length} records</span></div><div className="toolbar"><label htmlFor="employee-search">Search</label><input id="employee-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, number, or department" /></div><section className="employee-grid">{visible.map((employee) => <button className="employee-card employee-card-button" key={employee._id} onClick={() => onSelect(employee._id)}><div className="avatar">{employee.firstName[0]}{employee.lastName[0]}</div><div><h2>{employee.firstName} {employee.lastName}</h2><p>{employee.jobPosition || 'Position not assigned'}</p><span className={`status status-${employee.status}`}>{employee.status}</span></div><dl><div><dt>Department</dt><dd>{employee.department || 'Unassigned'}</dd></div><div><dt>Employee no.</dt><dd>{employee.employeeNumber}</dd></div><div><dt>Schedule</dt><dd>{employee.workingScheduleId?.name || 'Unassigned'}</dd></div></dl><span className="card-arrow">View record →</span></button>)}{!visible.length && <EmptyState>No employee records match this search.</EmptyState>}</section></>
}

function EmployeeDetail({ employee, onBack }) {
  return <><button className="back-button" onClick={onBack}>← Back to employees</button><div className="view-heading"><div><span className="section-kicker">Employee record</span><h1>{employee.firstName} {employee.lastName}</h1><p>{employee.jobPosition || 'Position not assigned'} · {employee.department || 'Department not assigned'}</p></div><span className={`status status-${employee.status}`}>{employee.status}</span></div><section className="detail-grid"><article className="dashboard-panel"><div className="panel-heading"><h2>Profile</h2><span>{employee.employeeNumber}</span></div><dl className="detail-list"><div><dt>Work email</dt><dd>{employee.workEmail || 'Not assigned'}</dd></div><div><dt>Manager</dt><dd>{employee.managerId ? `${employee.managerId.firstName} ${employee.managerId.lastName}` : 'Not assigned'}</dd></div><div><dt>Working schedule</dt><dd>{employee.workingScheduleId?.name || 'Not assigned'}</dd></div><div><dt>Employee type</dt><dd>{employee.employeeType.replace('_', ' ')}</dd></div></dl></article><article className="dashboard-panel"><div className="panel-heading"><h2>Related records</h2><span>Operational hub</span></div><div className="smart-grid">{Object.entries(employee.relatedCounts || {}).map(([key, value]) => <div key={key}><strong>{value}</strong><span>{key.replace(/([A-Z])/g, ' $1')}</span></div>)}</div></article></section></>
}

function AttendanceView({ attendance, onCheckIn, onCheckOut, message }) {
  return <><div className="view-heading"><div><span className="section-kicker">Daily time</span><h1>Attendance</h1><p>Check-ins, exceptions, and authorized corrections in one review queue.</p></div><div className="action-row"><button className="primary-button compact" onClick={onCheckIn}>Check in</button><button className="primary-button compact" onClick={onCheckOut}>Check out</button></div></div>{message && <p className="notice">{message}</p>}<section className="table-panel"><table><thead><tr><th>Date</th><th>Employee</th><th>Check in</th><th>Check out</th><th>Worked</th><th>Status</th></tr></thead><tbody>{attendance.map((entry) => <tr key={entry._id}><td>{new Date(entry.workDate).toLocaleDateString()}</td><td>{entry.employeeId?.firstName} {entry.employeeId?.lastName}</td><td>{entry.checkIn ? new Date(entry.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td><td>{entry.checkOut ? new Date(entry.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td><td>{entry.workedHours} hrs</td><td><span className={`status status-${entry.status}`}>{entry.status.replace('_', ' ')}</span></td></tr>)}</tbody></table>{!attendance.length && <EmptyState>No attendance records yet.</EmptyState>}</section></>
}

function TimeOffView({ token, requests, allocations, types, employees, onRefresh, canManage }) {
  const [form, setForm] = useState({
    timeOffTypeId: '',
    startDate: '',
    endDate: '',
    requestedAmount: '',
    reason: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createTimeOffRequest(token, {
        ...form,
        requestedAmount: Number(form.requestedAmount),
      })
      setForm({ timeOffTypeId: '', startDate: '', endDate: '', requestedAmount: '', reason: '' })
      if (onRefresh) await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDecision(requestId, action) {
    try {
      setError('')
      if (action === 'approve') await approveTimeOffRequest(token, requestId)
      if (action === 'refuse') await refuseTimeOffRequest(token, requestId)
      if (onRefresh) await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const remainingByType = new Map((allocations || []).map((allocation) => [allocation.timeOffTypeId?._id || allocation.timeOffTypeId, allocation.allocatedAmount - allocation.usedAmount]))

  return <><div className="view-heading"><div><span className="section-kicker">Leave operations</span><h1>Time off</h1><p>Submit requests, track balances, and maintain payroll-safe approvals.</p></div><span className="count-chip">{requests.length} requests</span></div>{error && <ErrorState message={error} />}<section className="dashboard-grid"><article className="dashboard-panel"><div className="panel-heading"><h2>New leave request</h2><span>{types.length} configured policies</span></div><form className="wizard-form" onSubmit={submit}><label>Leave type<select required value={form.timeOffTypeId} onChange={(event) => setForm({ ...form, timeOffTypeId: event.target.value })}><option value="">Choose a policy</option>{types.map((type) => <option value={type._id} key={type._id}>{type.name} ({type.unit})</option>)}</select></label><label>Start date<input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label><label>End date<input required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label><label>Requested amount<input required type="number" min="0" step="0.5" value={form.requestedAmount} onChange={(event) => setForm({ ...form, requestedAmount: event.target.value })} /></label><label>Reason<input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></label><button className="primary-button" disabled={saving}>{saving ? 'Submitting...' : 'Submit request'}</button></form></article><article className="dashboard-panel"><div className="panel-heading"><h2>Balance overview</h2><span>{allocations.length} allocations</span></div><div className="selection-list">{allocations.map((allocation) => <div key={allocation._id} className="list-item"><strong>{allocation.timeOffTypeId?.name || 'Leave type'}</strong><span>{allocation.employeeId?.firstName} {allocation.employeeId?.lastName}</span><small>Remaining: {Math.max(0, (allocation.allocatedAmount || 0) - (allocation.usedAmount || 0))}</small><small>{allocation.status}</small></div>)}{!allocations.length && <EmptyState>No leave allocations yet.</EmptyState>}</div></article></section><section className="table-panel"><table><thead><tr><th>Employee</th><th>Policy</th><th>Period</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{requests.map((request) => <tr key={request._id}><td>{request.employeeId?.firstName || ''} {request.employeeId?.lastName || ''}</td><td>{request.timeOffTypeId?.name || 'Type'}</td><td>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</td><td>{request.requestedAmount}</td><td><span className={`status status-${request.status}`}>{request.status}</span></td><td>{request.status === 'submitted' ? <><button className="primary-button compact" onClick={() => handleDecision(request._id, 'approve')}>Approve</button><button className="logout-button compact" onClick={() => handleDecision(request._id, 'refuse')}>Refuse</button></> : '-'}</td></tr>)}</tbody></table>{!requests.length && <EmptyState>No leave requests found.</EmptyState>}</section></>
}

function SalaryConfigView({ token, structures }) {
  const [structureForm, setStructureForm] = useState({ name: '', code: '', description: '' })
  const [ruleForm, setRuleForm] = useState({ salaryStructureId: structures[0]?._id || '', name: '', code: '', category: 'basic', sequence: 1, amountType: 'fixed', amount: '', percentage: '', formula: '', dependsOn: '' })
  const [error, setError] = useState('')
  const [savingStructure, setSavingStructure] = useState(false)
  const [savingRule, setSavingRule] = useState(false)
  const [structureRules, setStructureRules] = useState([])
  const [calculation, setCalculation] = useState(null)

  useEffect(() => {
    if (!ruleForm.salaryStructureId) {
      setStructureRules([])
      setCalculation(null)
      return
    }
    async function loadRules() {
      try {
        const rules = await fetchSalaryRules(token, ruleForm.salaryStructureId)
        setStructureRules(rules)
      } catch (requestError) {
        setError(requestError.message)
      }
    }
    void loadRules()
  }, [ruleForm.salaryStructureId, token])

  async function handleCreateStructure(event) {
    event.preventDefault()
    setSavingStructure(true)
    setError('')
    try {
      await createSalaryStructure(token, structureForm)
      setStructureForm({ name: '', code: '', description: '' })
      window.location.reload()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingStructure(false)
    }
  }

  async function handleCreateRule(event) {
    event.preventDefault()
    setSavingRule(true)
    setError('')
    try {
      await createSalaryRule(token, ruleForm.salaryStructureId, {
        ...ruleForm,
        sequence: Number(ruleForm.sequence),
        amount: ruleForm.amount === '' ? undefined : Number(ruleForm.amount),
        percentage: ruleForm.percentage === '' ? undefined : Number(ruleForm.percentage),
        dependsOn: ruleForm.dependsOn ? ruleForm.dependsOn.split(',').map((item) => item.trim()).filter(Boolean) : [],
      })
      const rules = await fetchSalaryRules(token, ruleForm.salaryStructureId)
      setStructureRules(rules)
      setRuleForm({ ...ruleForm, name: '', code: '', amount: '', percentage: '', formula: '', dependsOn: '', sequence: Number(ruleForm.sequence) + 1 })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSavingRule(false)
    }
  }

  async function handleCalculation() {
    if (!ruleForm.salaryStructureId) return
    try {
      setError('')
      const sampleInputs = { BASIC: 3000, WORKED_DAYS: 22, APPROVED_LEAVE_DAYS: 1 }
      const calculation = await calculateSalaryStructure(token, ruleForm.salaryStructureId, sampleInputs)
      setCalculation(calculation.calculation)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return <><div className="view-heading"><div><span className="section-kicker">Payroll configuration</span><h1>Salary structures</h1><p>Configure the rule-driven salary engine for each payroll structure.</p></div><span className="count-chip">{structures.length} structures</span></div>{error && <ErrorState message={error} />}<section className="dashboard-grid"><article className="dashboard-panel"><div className="panel-heading"><h2>Create structure</h2><span>Template</span></div><form className="wizard-form" onSubmit={handleCreateStructure}><label>Name<input required value={structureForm.name} onChange={(event) => setStructureForm({ ...structureForm, name: event.target.value })} /></label><label>Code<input required value={structureForm.code} onChange={(event) => setStructureForm({ ...structureForm, code: event.target.value })} /></label><label>Description<input value={structureForm.description} onChange={(event) => setStructureForm({ ...structureForm, description: event.target.value })} /></label><button className="primary-button" disabled={savingStructure}>{savingStructure ? 'Saving...' : 'Create structure'}</button></form></article><article className="dashboard-panel"><div className="panel-heading"><h2>Add rule</h2><span>Rule engine</span></div><form className="wizard-form" onSubmit={handleCreateRule}><label>Structure<select required value={ruleForm.salaryStructureId} onChange={(event) => setRuleForm({ ...ruleForm, salaryStructureId: event.target.value })}><option value="">Select structure</option>{structures.map((structure) => <option value={structure._id} key={structure._id}>{structure.name}</option>)}</select></label><label>Name<input required value={ruleForm.name} onChange={(event) => setRuleForm({ ...ruleForm, name: event.target.value })} /></label><label>Code<input required value={ruleForm.code} onChange={(event) => setRuleForm({ ...ruleForm, code: event.target.value })} /></label><label>Category<select value={ruleForm.category} onChange={(event) => setRuleForm({ ...ruleForm, category: event.target.value })}><option value="basic">Basic</option><option value="allowance">Allowance</option><option value="gross">Gross</option><option value="deduction">Deduction</option><option value="contribution">Contribution</option><option value="net">Net</option></select></label><label>Sequence<input type="number" min="1" value={ruleForm.sequence} onChange={(event) => setRuleForm({ ...ruleForm, sequence: Number(event.target.value) })} /></label><label>Amount type<select value={ruleForm.amountType} onChange={(event) => setRuleForm({ ...ruleForm, amountType: event.target.value })}><option value="fixed">Fixed</option><option value="percentage">Percentage</option><option value="formula">Formula</option></select></label>{ruleForm.amountType === 'fixed' && <label>Amount<input type="number" min="0" step="0.01" value={ruleForm.amount} onChange={(event) => setRuleForm({ ...ruleForm, amount: event.target.value })} /></label>}{ruleForm.amountType === 'percentage' && <label>Percentage<input type="number" min="0" max="100" step="0.01" value={ruleForm.percentage} onChange={(event) => setRuleForm({ ...ruleForm, percentage: event.target.value })} /></label>}{ruleForm.amountType === 'formula' && <label>Formula<input value={ruleForm.formula} onChange={(event) => setRuleForm({ ...ruleForm, formula: event.target.value })} placeholder="BASIC + 500" /></label>}<label>Depends on<input value={ruleForm.dependsOn} onChange={(event) => setRuleForm({ ...ruleForm, dependsOn: event.target.value })} placeholder="BASIC, GROSS" /></label><button className="primary-button" disabled={savingRule}>{savingRule ? 'Saving...' : 'Create rule'}</button></form></article></section><section className="table-panel"><div className="panel-heading"><h2>Current rules</h2><button className="primary-button compact" onClick={handleCalculation}>Preview calculation</button></div><table><thead><tr><th>Sequence</th><th>Code</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead><tbody>{structureRules.map((rule) => <tr key={rule._id}><td>{rule.sequence}</td><td>{rule.code}</td><td>{rule.category}</td><td>{rule.amountType}</td><td>{rule.amountType === 'fixed' ? `$${Number(rule.amount || 0).toLocaleString()}` : rule.amountType === 'percentage' ? `${rule.percentage}%` : rule.formula}</td></tr>)}</tbody></table>{!structureRules.length && <EmptyState>Select a salary structure to view its rules.</EmptyState>}</section>{calculation && <section className="dashboard-panel"><div className="panel-heading"><h2>Preview calculation</h2><span>Sample values</span></div><div className="selection-list">{calculation.lines.map((line) => <div key={line.code} className="list-item"><strong>{line.code}</strong><span>{line.category}</span><small>$ {Number(line.amount).toLocaleString()}</small></div>)}<div className="list-item"><strong>Gross</strong><span>total</span><small>$ {Number(calculation.grossAmount).toLocaleString()}</small></div><div className="list-item"><strong>Net</strong><span>total</span><small>$ {Number(calculation.netAmount).toLocaleString()}</small></div></div></section>}</>
}

function ContractsView({ token, employees, contracts, structures, schedules, onRefresh }) {
  const [form, setForm] = useState({
    employeeId: '',
    title: '',
    department: '',
    position: '',
    startDate: '',
    endDate: '',
    currency: 'USD',
    salaryStructureId: '',
    workingScheduleId: '',
    status: 'active',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createContract(token, {
        ...form,
        wage: Number(form.wage),
        salaryStructureId: form.salaryStructureId || structures[0]?._id,
        workingScheduleId: form.workingScheduleId || undefined,
      })
      setForm({
        employeeId: '',
        title: '',
        department: '',
        position: '',
        startDate: '',
        endDate: '',
        wage: '',
        currency: 'USD',
        salaryStructureId: '',
        workingScheduleId: '',
        status: 'active',
      })
      if (onRefresh) await onRefresh()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return <><div className="view-heading"><div><span className="section-kicker">Contract records</span><h1>Contracts & schedules</h1><p>Track active terms, schedule assignments, and payroll-ready contract history.</p></div><span className="count-chip">{contracts.length} active records</span></div>{error && <ErrorState message={error} />}<section className="dashboard-grid"><article className="dashboard-panel"><div className="panel-heading"><h2>Create contract</h2><span>Historical terms</span></div><form className="wizard-form" onSubmit={submit}><label>Employee<select required value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })}><option value="">Choose an employee</option>{employees.map((employee) => <option value={employee._id} key={employee._id}>{employee.firstName} {employee.lastName}</option>)}</select></label><label>Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label>Department<input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} /></label><label>Position<input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} /></label><label>Start date<input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label><label>End date<input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label><label>Wage<input required type="number" min="0" step="0.01" value={form.wage} onChange={(event) => setForm({ ...form, wage: event.target.value })} /></label><label>Currency<input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} /></label><label>Salary structure<select value={form.salaryStructureId} onChange={(event) => setForm({ ...form, salaryStructureId: event.target.value })}><option value="">Choose a structure</option>{structures.map((structure) => <option value={structure._id} key={structure._id}>{structure.name}</option>)}</select></label><label>Working schedule<select value={form.workingScheduleId} onChange={(event) => setForm({ ...form, workingScheduleId: event.target.value })}><option value="">No schedule assigned</option>{schedules.map((schedule) => <option value={schedule._id} key={schedule._id}>{schedule.name} ({schedule.weeklyHours}h)</option>)}</select></label><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Active</option><option value="draft">Draft</option></select></label><button className="primary-button" disabled={saving}>{saving ? 'Saving...' : 'Save contract'}</button></form></article><article className="dashboard-panel"><div className="panel-heading"><h2>Contract list</h2><span>{contracts.length} terms</span></div><div className="selection-list">{contracts.map((contract) => <div key={contract._id} className="list-item"><strong>{contract.title}</strong><span>{contract.employeeId?.firstName} {contract.employeeId?.lastName}</span><small>{new Date(contract.startDate).toLocaleDateString()} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Open ended'}</small><small>{contract.status} · ${Number(contract.wage).toLocaleString()} {contract.currency}</small></div>)}{!contracts.length && <EmptyState>No contracts found.</EmptyState>}</div></article></section></>
}

function PayrollView({ token, payruns, structures }) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ salaryStructureId: '', periodStart: '', periodEnd: '' })
  const [preview, setPreview] = useState(null)
  const [selected, setSelected] = useState([])
  const [detail, setDetail] = useState(null)
  const [error, setError] = useState('')

  async function continueWizard(event) {
    event.preventDefault()
    try { setError(''); setPreview(await previewPayrun(token, form)); setStep(2) } catch (requestError) { setError(requestError.message) }
  }

  async function openPayrun(id) {
    try { setError(''); setDetail(await fetchPayrun(token, id)) } catch (requestError) { setError(requestError.message) }
  }

  async function savePayrun() {
    try {
      setError('')
      await createPayrun(token, { ...form, employeeIds: selected, code: `PAY-${form.periodStart}`, name: `Payroll ${form.periodStart}` })
      setWizardOpen(false)
      window.location.reload()
    } catch (requestError) { setError(requestError.message) }
  }

  async function runAction(action) {
    try {
      setError('')
      const result = await action(token, detail.payrun._id)
      if (result.payrun) setDetail(await fetchPayrun(token, detail.payrun._id))
      if (result.message) setError(result.message)
    } catch (requestError) { setError(requestError.message) }
  }

  const actionByStatus = {
    draft: { label: 'Compute payslips', action: computePayrun },
    computed: { label: 'Validate payrun', action: validatePayrun },
    validated: { label: 'Mark as paid', action: markPayrunPaid },
    paid: { label: 'Send payslips', action: sendPayrunPayslips },
  }

  if (detail) return <><button className="back-button" onClick={() => setDetail(null)}>← Back to payruns</button><div className="view-heading"><div><span className="section-kicker">Payslip batch</span><h1>{detail.payrun.name}</h1><p>{detail.payrun.status} · {detail.payslips.length} payslips</p></div><span className={`status status-${detail.payrun.status}`}>{detail.payrun.status}</span></div>{error && <ErrorState message={error} />}<div className="action-row">{actionByStatus[detail.payrun.status] && <button className="primary-button compact" onClick={() => runAction(actionByStatus[detail.payrun.status].action)}>{actionByStatus[detail.payrun.status].label}</button>}</div><section className="table-panel"><table><thead><tr><th>Employee</th><th>Period</th><th>Gross</th><th>Net</th><th>Status</th></tr></thead><tbody>{detail.payslips.map((payslip) => <tr key={payslip._id}><td>{payslip.employeeSnapshot?.name}</td><td>{new Date(payslip.periodStart).toLocaleDateString()}</td><td>{payslip.grossAmount.toLocaleString()}</td><td>{payslip.netAmount.toLocaleString()}</td><td><span className={`status status-${payslip.status}`}>{payslip.status}</span></td></tr>)}</tbody></table>{!detail.payslips.length && <EmptyState>No payslips generated yet.</EmptyState>}</section></>

  return <><div className="view-heading"><div><span className="section-kicker">Payrun operations</span><h1>Payroll</h1><p>Configure a period, select eligible people, then process the batch.</p></div><button className="primary-button" onClick={() => { setWizardOpen(true); setStep(1) }}>New payrun</button></div>{error && <ErrorState message={error} />}{wizardOpen && <section className="wizard-panel"><div className="panel-heading"><h2>New payrun · Step {step} of 2</h2><button className="back-button" onClick={() => setWizardOpen(false)}>Close</button></div>{step === 1 ? <form className="wizard-form" onSubmit={continueWizard}><label>Salary structure<select required value={form.salaryStructureId} onChange={(event) => setForm({ ...form, salaryStructureId: event.target.value })}><option value="">Choose a structure</option>{structures.map((structure) => <option value={structure._id} key={structure._id}>{structure.name}</option>)}</select></label><label>Period start<input required type="date" value={form.periodStart} onChange={(event) => setForm({ ...form, periodStart: event.target.value })} /></label><label>Period end<input required type="date" value={form.periodEnd} onChange={(event) => setForm({ ...form, periodEnd: event.target.value })} /></label><button className="primary-button">Continue to employees →</button></form> : <><p className="wizard-summary">{preview?.eligibleEmployees.length || 0} eligible employees found. Select the people to include in this payrun.</p><div className="selection-list">{preview?.eligibleEmployees.map(({ employee }) => <label key={employee._id}><input type="checkbox" checked={selected.includes(employee._id)} onChange={(event) => setSelected(event.target.checked ? [...selected, employee._id] : selected.filter((id) => id !== employee._id))} />{employee.firstName} {employee.lastName}<span>{employee.department || 'Unassigned'}</span></label>)}</div><button className="primary-button" disabled={!selected.length} onClick={savePayrun}>Create payrun with {selected.length} employees</button></>}</section>}<section className="payrun-list">{payruns.map((payrun) => <button key={payrun._id} onClick={() => openPayrun(payrun._id)}><div><strong>{payrun.name}</strong><span>{new Date(payrun.periodStart).toLocaleDateString()} - {new Date(payrun.periodEnd).toLocaleDateString()}</span></div><b>{payrun.status}</b></button>)}{!payruns.length && <EmptyState>No payruns created yet.</EmptyState>}</section></>
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('peoplepay360_token'))
  const [user, setUser] = useState(null)
  const [activeView, setActiveView] = useState('dashboard')
  const [employees, setEmployees] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [timeOff, setTimeOff] = useState([])
  const [timeOffAllocations, setTimeOffAllocations] = useState([])
  const [timeOffTypes, setTimeOffTypes] = useState([])
  const [contracts, setContracts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [payruns, setPayruns] = useState([])
  const [structures, setStructures] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function refreshData() {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [dashboardResult, employeeResult, attendanceResult, timeOffResult, typeResult, allocationResult, contractResult, scheduleResult, payrunResult, structureResult] = await Promise.allSettled([
        fetchDashboard(token),
        fetchEmployees(token),
        fetchAttendance(token),
        fetchTimeOffRequests(token),
        fetchTimeOffTypes(token),
        fetchTimeOffAllocations(token),
        fetchContracts(token),
        fetchSchedules(token),
        fetchPayruns(token),
        fetchSalaryStructures(token),
      ])

      if (dashboardResult.status === 'fulfilled') setDashboard(dashboardResult.value)
      if (employeeResult.status === 'fulfilled') setEmployees(employeeResult.value)
      if (attendanceResult.status === 'fulfilled') setAttendance(attendanceResult.value)
      if (timeOffResult.status === 'fulfilled') setTimeOff(timeOffResult.value)
      if (typeResult.status === 'fulfilled') setTimeOffTypes(typeResult.value)
      if (allocationResult.status === 'fulfilled') setTimeOffAllocations(allocationResult.value)
      if (contractResult.status === 'fulfilled') setContracts(contractResult.value)
      if (scheduleResult.status === 'fulfilled') setSchedules(scheduleResult.value)
      if (payrunResult.status === 'fulfilled') setPayruns(payrunResult.value)
      if (structureResult.status === 'fulfilled') setStructures(structureResult.value)

      const rejected = [dashboardResult, employeeResult, attendanceResult, timeOffResult, typeResult, allocationResult, contractResult, scheduleResult, payrunResult, structureResult]
        .find((result) => result.status === 'rejected' && !String(result.reason?.message || '').includes('Insufficient permissions'))
      if (rejected) setError(rejected.reason.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    void fetchCurrentUser(token).then((result) => {
      setUser(result.user)
      if (result.user.role === 'employee') setActiveView('employees')
    }).catch((requestError) => setError(requestError.message))
    void refreshData()
  }, [token])

  function handleLogin(result) {
    localStorage.setItem('peoplepay360_token', result.token)
    setUser(result.user)
    setActiveView(result.user.role === 'employee' ? 'employees' : 'dashboard')
    setToken(result.token)
  }
  function handleLogout() { localStorage.removeItem('peoplepay360_token'); setToken(null); setUser(null); setDashboard(null) }
  async function openEmployee(id) { try { setLoading(true); setSelectedEmployee(await fetchEmployee(token, id)) } catch (requestError) { setError(requestError.message) } finally { setLoading(false) } }
  async function handleCheckIn() { try { await checkIn(token); setMessage('Check-in recorded.'); setAttendance(await fetchAttendance(token)) } catch (requestError) { setMessage(requestError.message) } }
  async function handleCheckOut() { try { await checkOut(token); setMessage('Check-out recorded.'); setAttendance(await fetchAttendance(token)) } catch (requestError) { setMessage(requestError.message) } }

  if (!token) return <LoginScreen onLogin={handleLogin} />
  if (loading && !dashboard) return <main className="centered-state"><LoadingState /></main>
  const availableNavigation = user?.role === 'employee'
    ? navigation.filter((item) => ['employees', 'attendance', 'time-off'].includes(item.id))
    : navigation
  const content = selectedEmployee
    ? <EmployeeDetail employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} />
    : activeView === 'dashboard'
      ? (dashboard ? <DashboardView dashboard={dashboard} /> : <LoadingState />)
      : activeView === 'employees'
        ? <EmployeesView employees={employees} onSelect={openEmployee} />
        : activeView === 'contracts'
          ? <ContractsView token={token} employees={employees} contracts={contracts} structures={structures} schedules={schedules} onRefresh={refreshData} />
          : activeView === 'attendance'
            ? <AttendanceView attendance={attendance} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} message={message} />
            : activeView === 'time-off'
              ? <TimeOffView token={token} requests={timeOff} allocations={timeOffAllocations} types={timeOffTypes} employees={employees} onRefresh={refreshData} canManage={user?.role !== 'employee'} />
              : activeView === 'salary'
                ? <SalaryConfigView token={token} structures={structures} />
                : <PayrollView token={token} payruns={payruns} structures={structures} />

  return <div className="workspace"><aside className="sidebar"><div className="brand-mark">PP<span>360</span></div><p className="sidebar-label">Workspace</p><nav>{availableNavigation.map((item) => <button className={activeView === item.id ? 'nav-item active' : 'nav-item'} key={item.id} onClick={() => { setSelectedEmployee(null); setActiveView(item.id) }}><span className="nav-icon">{item.label.slice(0, 1)}</span>{item.label}</button>)}</nav><div className="sidebar-bottom"><span className="role-label">{user?.role === 'employee' ? 'Employee workspace' : 'Live workspace'}</span><button className="logout-button" onClick={handleLogout}>Sign out</button></div></aside><main className="main-content"><header className="topbar"><span>PeoplePay360 / {navigation.find((item) => item.id === activeView)?.label || 'Employee'}</span><span className="connection-dot">● Connected</span></header>{error && <ErrorState message={error} />}{content}</main></div>
}

export default App
