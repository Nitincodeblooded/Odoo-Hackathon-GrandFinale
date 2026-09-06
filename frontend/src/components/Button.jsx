export function Button({ children, variant = 'primary', size = 'medium', disabled, onClick, type = 'button', className = '' }) {
  const baseClass = 'button'
  const variantClass = `button-${variant}`
  const sizeClass = `button-${size}`
  const classes = [baseClass, variantClass, sizeClass, className].filter(Boolean).join(' ')
  
  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
