import { client } from '../../../core/api/client'
import { isLocal } from '../../../core/data/mode'
import * as local from '../../../core/data/local/api'
const serverGetDashboardStats = () => client.get('/dashboard/stats').then((r: any) => r.data)

// The phone version answers from local storage; the server version calls the API. Picked when the app is built.
export const getDashboardStats = isLocal() ? local.getDashboardStats : serverGetDashboardStats
