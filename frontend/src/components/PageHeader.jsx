export function PageHeader({ title, subtitle, description, badge, action, children }) {
  if (children) return <div className="page-header">{children}</div>
  
  return (
    <div className="page-header">
      <div className="page-header-content">
        {subtitle && <span className="page-subtitle">{subtitle}</span>}
        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          {badge}
        </div>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  )
}
