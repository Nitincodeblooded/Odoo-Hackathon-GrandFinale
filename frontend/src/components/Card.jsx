export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardHeader({ children, title, subtitle, action }) {
  if (children) return <div className="card-header">{children}</div>
  
  return (
    <div className="card-header">
      <div>
        {subtitle && <span className="card-subtitle">{subtitle}</span>}
        {title && <h2 className="card-title">{title}</h2>}
      </div>
      {action && <div className="card-action">{action}</div>}
    </div>
  )
}

export function CardContent({ children, className = '' }) {
  return <div className={`card-content ${className}`}>{children}</div>
}
