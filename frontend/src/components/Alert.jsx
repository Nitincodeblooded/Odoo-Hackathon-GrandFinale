import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

export function Alert({ variant = 'info', title, children, onClose }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }
  
  const Icon = icons[variant] || Info
  
  return (
    <div className={`alert alert-${variant}`}>
      <Icon size={20} className="alert-icon" />
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose}>
          <XCircle size={16} />
        </button>
      )}
    </div>
  )
}
