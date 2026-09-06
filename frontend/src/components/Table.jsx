export function Table({ children, className = '' }) {
  return (
    <div className={`table-container ${className}`}>
      <table className="table">{children}</table>
    </div>
  )
}

export function TableHead({ children }) {
  return <thead className="table-head">{children}</thead>
}

export function TableBody({ children }) {
  return <tbody className="table-body">{children}</tbody>
}

export function TableRow({ children, onClick, className = '' }) {
  const classes = `table-row ${onClick ? 'table-row-clickable' : ''} ${className}`.trim()
  return <tr className={classes} onClick={onClick}>{children}</tr>
}

export function TableHeader({ children, className = '' }) {
  return <th className={`table-header ${className}`}>{children}</th>
}

export function TableCell({ children, className = '' }) {
  return <td className={`table-cell ${className}`}>{children}</td>
}
