const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, options)
  const payload = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null
  if (!response.ok) throw new Error(payload?.error || 'Request failed')
  return payload
}

function authOptions(token, options = {}) {
  return { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } }
}

export async function login(email, password) {
  return request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
}

export async function fetchCurrentUser(token) {
  return request('/auth/me', authOptions(token))
}

export async function registerAccount(data) {
  return request('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
}

export async function fetchEmployees(token) {
  const payload = await request('/employees', authOptions(token))
  return payload.employees
}

export async function fetchEmployee(token, employeeId) {
  const payload = await request(`/employees/${employeeId}`, authOptions(token))
  return payload.employee
}

export async function fetchDashboard(token, filters = {}) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value))
  return request(`/dashboard?${query}`, authOptions(token))
}

export async function fetchAttendance(token) {
  const payload = await request('/attendance', authOptions(token))
  return payload.attendance
}

export async function checkIn(token) {
  return request('/attendance/check-in', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }))
}

export async function checkOut(token) {
  return request('/attendance/check-out', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }))
}

export async function fetchTimeOffTypes(token) {
  const payload = await request('/time-off/types', authOptions(token))
  return payload.types
}

export async function fetchTimeOffAllocations(token) {
  const payload = await request('/time-off/allocations', authOptions(token))
  return payload.allocations
}

export async function fetchTimeOffRequests(token) {
  const payload = await request('/time-off/requests', authOptions(token))
  return payload.requests
}

export async function createTimeOffRequest(token, data) {
  return request('/time-off/requests', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function approveTimeOffRequest(token, requestId) {
  return request(`/time-off/requests/${requestId}/approve`, authOptions(token, { method: 'POST' }))
}

export async function refuseTimeOffRequest(token, requestId) {
  return request(`/time-off/requests/${requestId}/refuse`, authOptions(token, { method: 'POST' }))
}

export async function fetchContracts(token, employeeId) {
  const query = employeeId ? `?employeeId=${encodeURIComponent(employeeId)}` : ''
  const payload = await request(`/contracts${query}`, authOptions(token))
  return payload.contracts
}

export async function createContract(token, data) {
  return request('/contracts', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function fetchSchedules(token) {
  const payload = await request('/working-schedules', authOptions(token))
  return payload.schedules
}

export async function createSchedule(token, data) {
  return request('/working-schedules', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function fetchPayruns(token) {
  const payload = await request('/payruns', authOptions(token))
  return payload.payruns
}

export async function fetchSalaryStructures(token) {
  const payload = await request('/salary-structures', authOptions(token))
  return payload.structures
}

export async function fetchSalaryRules(token, structureId) {
  const payload = await request(`/salary-structures/${structureId}/rules`, authOptions(token))
  return payload.rules
}

export async function createSalaryStructure(token, data) {
  return request('/salary-structures', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function createSalaryRule(token, structureId, data) {
  return request(`/salary-structures/${structureId}/rules`, authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function calculateSalaryStructure(token, structureId, inputs) {
  return request(`/salary-structures/${structureId}/calculate`, authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inputs }) }))
}

export async function previewPayrun(token, data) {
  return request('/payruns/preview', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function createPayrun(token, data) {
  return request('/payruns', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function fetchPayrun(token, payrunId) {
  return request(`/payruns/${payrunId}`, authOptions(token))
}

export async function computePayrun(token, payrunId) {
  return request(`/payruns/${payrunId}/compute`, authOptions(token, { method: 'POST' }))
}

export async function validatePayrun(token, payrunId) {
  return request(`/payruns/${payrunId}/validate`, authOptions(token, { method: 'POST' }))
}

export async function markPayrunPaid(token, payrunId) {
  return request(`/payruns/${payrunId}/mark-paid`, authOptions(token, { method: 'POST' }))
}

export async function sendPayrunPayslips(token, payrunId) {
  return request(`/payruns/${payrunId}/send-payslips`, authOptions(token, { method: 'POST' }))
}

export async function fetchPayslipDetail(token, payslipId) {
  return request(`/payslips/${payslipId}`, authOptions(token))
}

export async function createEmployee(token, data) {
  return request('/employees', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function updateEmployee(token, employeeId, data) {
  return request(`/employees/${employeeId}`, authOptions(token, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function createTimeOffType(token, data) {
  return request('/time-off/types', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function createTimeOffAllocation(token, data) {
  return request('/time-off/allocations', authOptions(token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

export async function approveTimeOffAllocation(token, allocationId) {
  return request(`/time-off/allocations/${allocationId}/approve`, authOptions(token, { method: 'POST' }))
}

export async function updateSchedule(token, scheduleId, data) {
  return request(`/working-schedules/${scheduleId}`, authOptions(token, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }))
}

