import { client } from '../../../core/api/client'
import { isLocal } from '../../../core/data/mode'
import * as local from '../../../core/data/local/api'

export interface Tree {
  id: number; tree_code: string; custom_common_name?: string
  health_score?: number; action: string; status: string
  priority: string; coord_x?: number; coord_y?: number
  species?: { common_name: string; scientific_name: string; ecosystem_roles: string[] }
  land_zones?: { zone_code: string; zone_name: string }
  assigned_user?: { name: string }
  approx_age_yrs?: number; height_m?: number; trunk_diameter_cm?: number
  action_notes?: string; public_notes?: string; decision_factors?: Record<string, any>
  planting_date?: string; completed_at?: string; updated_at: string
  assigned_to?: number
}

const serverGetPublicTree = (code: string) => client.get(`/trees/${code}/public`).then((r: any) => r.data)
const serverGetTrees = (params?: Record<string, any>) => client.get('/trees', { params }).then((r: any) => r.data)
const serverGetTree = (code: string) => client.get(`/trees/${code}`).then((r: any) => r.data)
const serverCreateTree = (data: any) => client.post('/trees', data).then((r: any) => r.data)
const serverUpdateTree = (code: string, data: any) => client.patch(`/trees/${code}`, data).then((r: any) => r.data)
const serverDeleteTree = (code: string) => client.delete(`/trees/${code}`).then((r: any) => r.data)
const serverGetActivity = (code: string) => client.get(`/trees/${code}/activity`).then((r: any) => r.data)
const serverAddActivity = (code: string, action_taken: string, notes?: string) =>
  client.post(`/trees/${code}/activity`, { action_taken, notes }).then((r: any) => r.data)
const serverGetHealth = (code: string) => client.get(`/trees/${code}/health`).then((r: any) => r.data)
const serverAddHealth = (code: string, data: any) => client.post(`/trees/${code}/health`, data).then((r: any) => r.data)
const serverGetPhotos = (code: string) => client.get(`/trees/${code}/photos`).then((r: any) => r.data)
const serverUploadPhoto = (code: string, file: File, type: string, caption?: string) => {
  const fd = new FormData()
  fd.append('photo', file); fd.append('photo_type', type)
  if (caption) fd.append('caption', caption)
  return client.post(`/trees/${code}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r: any) => r.data)
}
const serverGetContributors = (code: string) => client.get(`/trees/${code}/contributors`).then((r: any) => r.data)
const serverAddContributor = (code: string, data: any) => client.post(`/trees/${code}/contributors`, data).then((r: any) => r.data)

// The phone version answers from local storage; the server version calls the API. Picked when the app is built.
export const getPublicTree = isLocal() ? local.getPublicTree : serverGetPublicTree
export const getTrees = isLocal() ? local.getTrees : serverGetTrees
export const getTree = isLocal() ? local.getTree : serverGetTree
export const createTree = isLocal() ? local.createTree : serverCreateTree
export const updateTree = isLocal() ? local.updateTree : serverUpdateTree
export const deleteTree = isLocal() ? local.deleteTree : serverDeleteTree
export const getActivity = isLocal() ? local.getActivity : serverGetActivity
export const addActivity = isLocal() ? local.addActivity : serverAddActivity
export const getHealth = isLocal() ? local.getHealth : serverGetHealth
export const addHealth = isLocal() ? local.addHealth : serverAddHealth
export const getPhotos = isLocal() ? local.getPhotos : serverGetPhotos
export const uploadPhoto = isLocal() ? local.uploadPhoto : serverUploadPhoto
export const getContributors = isLocal() ? local.getContributors : serverGetContributors
export const addContributor = isLocal() ? local.addContributor : serverAddContributor
