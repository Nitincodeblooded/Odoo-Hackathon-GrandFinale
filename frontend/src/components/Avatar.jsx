export function Avatar({ firstName, lastName, size = 'medium', className = '' }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  const sizeClass = `avatar-${size}`
  
  return (
    <div className={`avatar ${sizeClass} ${className}`}>
      {initials}
    </div>
  )
}
