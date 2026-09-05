import { useEffect, useState } from 'react'
import { fetchDashboard, fetchEmployees } from './services/api'

function App() {
  const [employees, setEmployees] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const token = localStorage.getItem('peoplepay360_token')

  useEffect(() => {
    if (!token) return
    Promise.all([fetchDashboard(token), fetchEmployees(token)])
      .then(([dashboardData, employeeData]) => { setDashboard(dashboardData); setEmployees(employeeData) })
      .catch((requestError) => setError(requestError.message))
  }, [token])

  const visibleEmployees = employees.filter((employee) => {
    const query = search.toLowerCase()
    return `${employee.firstName} ${employee.lastName} ${employee.employeeNumber} ${employee.department || ''}`.toLowerCase().includes(query)
  })

  const kpis = dashboard?.kpis
  const maxDepartmentSalary = Math.max(...(dashboard?.charts.salaryByDepartment || []).map((item) => item.amount), 1)

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">PeoplePay360 · HR operations</p>
          <h1>Payroll control room</h1>
          <p className="lede">Live people, attendance, leave, and payroll signals for the selected period.</p>
        </div>
        <div className="header-stat"><strong>{employees.length}</strong><span>employees</span></div>
      </header>

      <section className="toolbar" aria-label="Employee tools">
        <label htmlFor="employee-search">Search employees</label>
        <input id="employee-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, number, or department" />
      </section>

      {!token && <p className="notice">Sign in through the API to load employee records.</p>}
      {error && <p className="notice error">{error}</p>}

      {dashboard && <>
        <section className="kpi-grid" aria-label="Payroll KPIs">
          <article className="kpi-card"><span>Net salary paid</span><strong>${kpis.totalNetSalaryPaid.toLocaleString()}</strong></article>
          <article className="kpi-card"><span>Payslips generated</span><strong>{kpis.payslipsGenerated}</strong></article>
          <article className="kpi-card"><span>Average salary</span><strong>${kpis.averageSalary.toLocaleString()}</strong></article>
          <article className="kpi-card"><span>Approved time off</span><strong>{kpis.approvedTimeOff}</strong></article>
          <article className="kpi-card"><span>Attendance health</span><strong>{kpis.attendanceHealth}%</strong></article>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <div className="panel-heading"><h2>Salary cost by department</h2><span>Paid net salary</span></div>
            {(dashboard.charts.salaryByDepartment.length === 0) && <p className="empty-state">No paid salary data for this period.</p>}
            {dashboard.charts.salaryByDepartment.map((item) => <div className="bar-row" key={item.department}><span>{item.department}</span><div className="bar-track"><i style={{ width: `${(item.amount / maxDepartmentSalary) * 100}%` }} /></div><b>${item.amount.toLocaleString()}</b></div>)}
          </article>
          <article className="dashboard-panel">
            <div className="panel-heading"><h2>Monthly net trend</h2><span>Paid net salary</span></div>
            <div className="trend-list">{dashboard.charts.monthlyNetSalary.map((item) => <div key={item.month}><span>{item.month}</span><b>${item.amount.toLocaleString()}</b></div>)}</div>
            {dashboard.charts.monthlyNetSalary.length === 0 && <p className="empty-state">No monthly salary data for this period.</p>}
          </article>
        </section>

        <section className="dashboard-panel alerts-panel">
          <div className="panel-heading"><h2>Operational alerts</h2><span>{dashboard.alerts.length} live signals</span></div>
          {dashboard.alerts.slice(0, 8).map((alert, index) => <div className="alert-row" key={`${alert.type}-${alert.payrunId || alert.employeeId || index}`}><span className={`alert-dot alert-${alert.severity}`} /><span>{alert.message}</span><small>{alert.type.replaceAll('_', ' ')}</small></div>)}
          {dashboard.alerts.length === 0 && <p className="empty-state">No operational alerts.</p>}
        </section>
      </>}

      <section className="section-heading"><h2>Employee hub</h2><span>{employees.length} records</span></section>
      <section className="employee-grid" aria-live="polite">
        {visibleEmployees.map((employee) => (
          <article className="employee-card" key={employee._id}>
            <div className="avatar">{employee.firstName[0]}{employee.lastName[0]}</div>
            <div>
              <h2>{employee.firstName} {employee.lastName}</h2>
              <p>{employee.jobPosition || 'Position not assigned'}</p>
              <span className={`status status-${employee.status}`}>{employee.status}</span>
            </div>
            <dl>
              <div><dt>Department</dt><dd>{employee.department || 'Unassigned'}</dd></div>
              <div><dt>Employee no.</dt><dd>{employee.employeeNumber}</dd></div>
              <div><dt>Schedule</dt><dd>{employee.workingScheduleId?.name || 'Unassigned'}</dd></div>
            </dl>
          </article>
        ))}
        {token && !error && visibleEmployees.length === 0 && <p className="empty-state">No employee records match this search.</p>}
      </section>
    </main>
  )
}

export default App
