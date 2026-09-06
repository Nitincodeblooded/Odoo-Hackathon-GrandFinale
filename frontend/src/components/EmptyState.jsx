import { FileX } from 'lucide-react'

export function EmptyState({ icon: Icon = FileX, title, message, action }) {
  return (
    <div className="empty-state">
      <Icon size={48} className="empty-state-icon" />
      {title && <h3 className="empty-state-title">{title}</h3>}
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}
