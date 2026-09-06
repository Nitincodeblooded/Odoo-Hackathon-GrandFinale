export function Badge({ children, variant = 'default', className = '' }) {
  const classes = `badge badge-${variant} ${className}`.trim()
  return <span className={classes}>{children}</span>
}

export function StatusBadge({ status }) {
  const statusMap = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'warning', label: 'Inactive' },
    terminated: { variant: 'error', label: 'Terminated' },
    draft: { variant: 'default', label: 'Draft' },
    submitted: { variant: 'info', label: 'Submitted' },
    approved: { variant: 'success', label: 'Approved' },
    refused: { variant: 'error', label: 'Refused' },
    cancelled: { variant: 'default', label: 'Cancelled' },
    present: { variant: 'success', label: 'Present' },
    late: { variant: 'warning', label: 'Late' },
    absent: { variant: 'error', label: 'Absent' },
    overtime: { variant: 'info', label: 'Overtime' },
    missing_checkout: { variant: 'warning', label: 'Missing Checkout' },
    corrected: { variant: 'info', label: 'Corrected' },
    computed: { variant: 'info', label: 'Computed' },
    validated: { variant: 'success', label: 'Validated' },
    paid: { variant: 'success', label: 'Paid' },
    computing: { variant: 'info', label: 'Computing' },
    expired: { variant: 'default', label: 'Expired' },
  }
  
  const config = statusMap[status] || { variant: 'default', label: status }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
