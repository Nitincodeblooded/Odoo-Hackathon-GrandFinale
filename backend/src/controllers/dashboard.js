import { buildDashboard } from '../services/dashboard.js'

export async function getDashboard(request, response, next) {
  try {
    const dashboard = await buildDashboard(request.query)
    return response.json(dashboard)
  } catch (error) {
    return next(error)
  }
}
