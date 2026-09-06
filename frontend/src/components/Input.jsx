export function Input({ label, error, helperText, className = '', ...props }) {
  const inputId = props.id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <input id={inputId} className={`input ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="input-error-message">{error}</span>}
      {helperText && !error && <span className="input-helper">{helperText}</span>}
    </div>
  )
}

export function Select({ label, error, helperText, options = [], className = '', children, ...props }) {
  const selectId = props.id || props.name || `select-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={selectId} className="input-label">{label}</label>}
      <select id={selectId} className={`input input-select ${error ? 'input-error' : ''}`} {...props}>
        {children || options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error-message">{error}</span>}
      {helperText && !error && <span className="input-helper">{helperText}</span>}
    </div>
  )
}

export function Textarea({ label, error, helperText, className = '', ...props }) {
  const textareaId = props.id || props.name || `textarea-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={textareaId} className="input-label">{label}</label>}
      <textarea id={textareaId} className={`input input-textarea ${error ? 'input-error' : ''}`} {...props} />
      {error && <span className="input-error-message">{error}</span>}
      {helperText && !error && <span className="input-helper">{helperText}</span>}
    </div>
  )
}
