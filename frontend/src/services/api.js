const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'

export async function fetchEmployees(token) {
  const response = await fetch(`${apiBaseUrl}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Unable to load employees')
  return payload.employees
}

export async function fetchDashboard(token, filters = {}) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
  const response = await fetch(`${apiBaseUrl}/dashboard?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Unable to load dashboard')
  return payload
}
