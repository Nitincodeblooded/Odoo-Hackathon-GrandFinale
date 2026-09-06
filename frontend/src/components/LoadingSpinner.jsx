export function LoadingSpinner({ size = 'medium', centered = false }) {
  const sizeClass = `spinner-${size}`
  const containerClass = centered ? 'spinner-container-centered' : 'spinner-container'
  
  return (
    <div className={containerClass}>
      <div className={`spinner ${sizeClass}`} />
    </div>
  )
}

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state">
      <LoadingSpinner />
      <span>{message}</span>
    </div>
  )
}
