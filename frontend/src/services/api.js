const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'

export async function fetchEmployees(token) {
  const response = await fetch(`${apiBaseUrl}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Unable to load employees')
  return payload.employees
}
