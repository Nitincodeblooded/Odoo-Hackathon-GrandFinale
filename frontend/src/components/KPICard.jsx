export function KPICard({ title, value, icon: Icon, trend, trendValue }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-card-title">{title}</span>
        {Icon && <Icon size={20} className="kpi-card-icon" />}
      </div>
      <div className="kpi-card-value">{value}</div>
      {trend && trendValue && (
        <div className={`kpi-card-trend kpi-card-trend-${trend}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}
        </div>
      )}
    </div>
  )
}
