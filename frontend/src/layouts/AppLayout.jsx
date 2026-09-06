import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Clock, 
  Calendar, 
  DollarSign, 
  Receipt,
  LogOut 
} from 'lucide-react'

export function AppLayout({ user, onLogout }) {
  const navigate = useNavigate()
  
  const navigation = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/contracts', label: 'Contracts', icon: FileText },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/time-off', label: 'Time Off', icon: Calendar },
    { to: '/salary', label: 'Salary', icon: DollarSign },
    { to: '/payroll', label: 'Payroll', icon: Receipt },
  ]
  
  const availableNav = user?.role === 'employee'
    ? navigation.filter(item => ['/employees', '/attendance', '/time-off'].includes(item.to))
    : navigation
  
  function handleLogout() {
    onLogout()
    navigate('/login')
  }
  
  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="brand-mark">
          PP<span>360</span>
        </div>
        <p className="sidebar-label">Workspace</p>
        <nav>
          {availableNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <span className="nav-icon">
                <item.icon size={16} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="role-label">
            {user?.role === 'employee' ? 'Employee workspace' : 'Live workspace'}
          </span>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: '0.5rem' }} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <span>PeoplePay360</span>
          <span className="connection-dot">● Connected</span>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
