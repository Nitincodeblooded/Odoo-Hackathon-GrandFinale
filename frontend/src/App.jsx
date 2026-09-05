import { useEffect, useState } from 'react'
import { fetchEmployees } from './services/api'

function App() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const token = localStorage.getItem('peoplepay360_token')

  useEffect(() => {
    if (!token) return
    fetchEmployees(token).then(setEmployees).catch((requestError) => setError(requestError.message))
  }, [token])

  const visibleEmployees = employees.filter((employee) => {
    const query = search.toLowerCase()
    return `${employee.firstName} ${employee.lastName} ${employee.employeeNumber} ${employee.department || ''}`.toLowerCase().includes(query)
  })

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">PeoplePay360 · HR operations</p>
          <h1>Employee hub</h1>
          <p className="lede">One place for people, schedules, contracts, attendance, and time off.</p>
        </div>
        <div className="header-stat"><strong>{employees.length}</strong><span>employees</span></div>
      </header>

      <section className="toolbar" aria-label="Employee tools">
        <label htmlFor="employee-search">Search employees</label>
        <input id="employee-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, number, or department" />
      </section>

      {!token && <p className="notice">Sign in through the API to load employee records.</p>}
      {error && <p className="notice error">{error}</p>}

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
