import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchDashboard, fetchEmployees } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { KPICard } from '../components/KPICard'
import { Card, CardHeader, CardContent } from '../components/Card'
import { LoadingState } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { Alert } from '../components/Alert'
import { Button } from '../components/Button'
import { Select, Input } from '../components/Input'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table'
import { DollarSign, FileText, TrendingUp, Calendar, Activity, Users, Filter, RefreshCw } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#295448', '#bd5c35', '#5a7c65', '#d97706', '#6b7280', '#3b82f6', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const { token } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter state
  const [filters, setFilters] = useState({
    periodStart: '',
    periodEnd: '',
    department: '',
    employeeType: ''
  })
  
  // Department breakdown state
  const [departmentBreakdown, setDepartmentBreakdown] = useState([])
  
  useEffect(() => {
    loadDashboard()
  }, [token]) // Added token dependency
  
  useEffect(() => {
    if (dashboard) {
      calculateDepartmentBreakdown()
    }
  }, [dashboard])
  
  async function loadDashboard(customFilters = {}) {
    setLoading(true)
    setError('')
    try {
      const appliedFilters = { ...filters, ...customFilters }
      // Remove empty filters
      Object.keys(appliedFilters).forEach(key => {
        if (!appliedFilters[key]) delete appliedFilters[key]
      })
      const data = await fetchDashboard(token, appliedFilters)
      setDashboard(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  async function calculateDepartmentBreakdown() {
    try {
      const employees = await fetchEmployees(token)
      const deptMap = new Map()
      
      employees.forEach(emp => {
        const dept = emp.department || 'Unassigned'
        if (!deptMap.has(dept)) {
          deptMap.set(dept, { department: dept, headcount: 0, totalSalary: 0 })
        }
        const deptData = deptMap.get(dept)
        deptData.headcount += 1
      })
      
      // Match with salary data from dashboard
      dashboard.charts.salaryByDepartment.forEach(({ department, amount }) => {
        if (deptMap.has(department)) {
          deptMap.get(department).totalSalary = amount
        }
      })
      
      setDepartmentBreakdown(
        Array.from(deptMap.values())
          .sort((a, b) => b.totalSalary - a.totalSalary)
      )
    } catch (err) {
      console.error('Failed to calculate department breakdown:', err)
    }
  }
  
  function handleApplyFilters() {
    loadDashboard()
    setShowFilters(false)
  }
  
  function handleResetFilters() {
    setFilters({
      periodStart: '',
      periodEnd: '',
      department: '',
      employeeType: ''
    })
    loadDashboard({
      periodStart: '',
      periodEnd: '',
      department: '',
      employeeType: ''
    })
    setShowFilters(false)
  }
  
  if (loading) return <LoadingState />
  if (error) return <Alert variant="error">{error}</Alert>
  if (!dashboard) return <EmptyState message="No dashboard data available" />
  
  const { kpis, charts, alerts, metadata } = dashboard
  
  // Calculate additional metrics
  const activeFiltersCount = Object.values(filters).filter(v => v).length
  
  return (
    <>
      <PageHeader
        subtitle="Live overview"
        title="Payroll control room"
        description="Real-time signals across people, attendance, leave, and paid salary."
        badge={
          <span className="count-chip">
            {new Date(dashboard.filters.periodStart).toLocaleDateString()} - {new Date(dashboard.filters.periodEnd).toLocaleDateString()}
          </span>
        }
        action={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button size="small" variant="ghost" onClick={() => loadDashboard()}>
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
              Refresh
            </Button>
            <Button size="small" onClick={() => setShowFilters(!showFilters)}>
              <Filter size={16} style={{ marginRight: '0.5rem' }} />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>
        }
      />
      
      {showFilters && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Input
                label="Period Start"
                type="date"
                value={filters.periodStart}
                onChange={(e) => setFilters({ ...filters, periodStart: e.target.value })}
              />
              <Input
                label="Period End"
                type="date"
                value={filters.periodEnd}
                onChange={(e) => setFilters({ ...filters, periodEnd: e.target.value })}
              />
              <Select
                label="Department"
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              >
                <option value="">All Departments</option>
                {departmentBreakdown.map(d => (
                  <option key={d.department} value={d.department}>{d.department}</option>
                ))}
              </Select>
              <Select
                label="Employee Type"
                value={filters.employeeType}
                onChange={(e) => setFilters({ ...filters, employeeType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contractor">Contractor</option>
                <option value="intern">Intern</option>
              </Select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <Button variant="ghost" onClick={handleResetFilters}>Reset</Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <section className="kpi-grid">
        <KPICard
          title="Net salary paid"
          value={`$${kpis.totalNetSalaryPaid.toLocaleString()}`}
          icon={DollarSign}
        />
        <KPICard
          title="Payslips generated"
          value={kpis.payslipsGenerated}
          icon={FileText}
        />
        <KPICard
          title="Average salary"
          value={`$${kpis.averageSalary.toLocaleString()}`}
          icon={TrendingUp}
        />
        <KPICard
          title="Approved time off"
          value={`${kpis.approvedTimeOff} days/hrs`}
          icon={Calendar}
        />
        <KPICard
          title="Attendance health"
          value={`${kpis.attendanceHealth}%`}
          icon={Activity}
        />
        <KPICard
          title="Active employees"
          value={metadata.employeeCount}
          icon={Users}
        />
      </section>
      
      <section className="dashboard-grid">
        <Card>
          <CardHeader>
            <h3 style={{ margin: 0 }}>Salary cost by department</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Paid net salary distribution</p>
          </CardHeader>
          <CardContent>
            {charts.salaryByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.salaryByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8dfd5" />
                  <XAxis dataKey="department" tick={{ fontSize: 12, fill: '#788278' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#788278' }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#bd5c35" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No salary data for this period" />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <h3 style={{ margin: 0 }}>Monthly net trend</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Paid net salary over time</p>
          </CardHeader>
          <CardContent>
            {charts.monthlyNetSalary.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={charts.monthlyNetSalary}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d8dfd5" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#788278' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#788278' }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="amount" stroke="#295448" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No monthly data for this period" />
            )}
          </CardContent>
        </Card>
      </section>
      
      <section className="dashboard-grid">
        <Card>
          <CardHeader>
            <h3 style={{ margin: 0 }}>Department breakdown</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Headcount and salary by department</p>
          </CardHeader>
          <CardContent>
            {departmentBreakdown.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Department</TableHeader>
                    <TableHeader>Headcount</TableHeader>
                    <TableHeader>Total Salary</TableHeader>
                    <TableHeader>Avg Salary</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentBreakdown.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell><strong>{dept.department}</strong></TableCell>
                      <TableCell>{dept.headcount}</TableCell>
                      <TableCell>${dept.totalSalary.toLocaleString()}</TableCell>
                      <TableCell>
                        ${dept.headcount > 0 ? Math.round(dept.totalSalary / dept.headcount).toLocaleString() : '0'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow style={{ fontWeight: 600, borderTop: '2px solid #295448' }}>
                    <TableCell>Total</TableCell>
                    <TableCell>{departmentBreakdown.reduce((sum, d) => sum + d.headcount, 0)}</TableCell>
                    <TableCell>${departmentBreakdown.reduce((sum, d) => sum + d.totalSalary, 0).toLocaleString()}</TableCell>
                    <TableCell>
                      ${departmentBreakdown.reduce((sum, d) => sum + d.headcount, 0) > 0
                        ? Math.round(departmentBreakdown.reduce((sum, d) => sum + d.totalSalary, 0) / departmentBreakdown.reduce((sum, d) => sum + d.headcount, 0)).toLocaleString()
                        : '0'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <EmptyState message="No department data available" />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <h3 style={{ margin: 0 }}>Department distribution</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Salary cost proportion</p>
          </CardHeader>
          <CardContent>
            {charts.salaryByDepartment.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.salaryByDepartment}
                    dataKey="amount"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {charts.salaryByDepartment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No department data for this period" />
            )}
          </CardContent>
        </Card>
      </section>
      
      <section className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Attendance overview</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{metadata.attendanceRecords} records</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 600, color: '#295448' }}>
                  {kpis.attendanceHealth}%
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Health rate</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '6px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Total Records</span>
                <strong>{metadata.attendanceRecords}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Period Coverage</span>
                <strong>
                  {Math.round((metadata.attendanceRecords / (metadata.employeeCount || 1)) / 30 * 100)}%
                </strong>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
              Attendance health represents the percentage of records marked as present, late, overtime, or corrected.
              Higher percentages indicate better workforce availability.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Time-off overview</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{metadata.approvedLeaveRequests} requests approved</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 600, color: '#bd5c35' }}>
                  {kpis.approvedTimeOff}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Days/Hours</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '6px', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Approved Requests</span>
                <strong>{metadata.approvedLeaveRequests}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Avg per Employee</span>
                <strong>
                  {metadata.employeeCount > 0 
                    ? (kpis.approvedTimeOff / metadata.employeeCount).toFixed(1)
                    : '0'} days/hrs
                </strong>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
              Total approved time-off includes vacation, sick leave, and other leave types.
              Tracking helps ensure adequate coverage and work-life balance.
            </p>
          </CardContent>
        </Card>
      </section>
      
      <Card className="alerts-panel">
        <CardHeader>
          <h3 style={{ margin: 0 }}>Operational alerts</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
            {alerts.length} live signals · {alerts.filter(a => a.severity === 'error').length} errors · {alerts.filter(a => a.severity === 'warning').length} warnings
          </p>
        </CardHeader>
        <CardContent>
          {alerts.slice(0, 15).map((alert, index) => (
            <div key={`${alert.type}-${index}`} className="alert-row">
              <span className={`alert-dot alert-${alert.severity}`} />
              <span style={{ flex: 1 }}>{alert.message}</span>
              <small style={{ color: '#666', textTransform: 'capitalize' }}>
                {alert.type.replaceAll('_', ' ')}
              </small>
            </div>
          ))}
          {alerts.length === 0 && <EmptyState message="No operational alerts" />}
          {alerts.length > 15 && (
            <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
              ...and {alerts.length - 15} more alerts
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
