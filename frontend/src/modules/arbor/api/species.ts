import { client } from '../../../core/api/client'
import { isLocal } from '../../../core/data/mode'
import * as local from '../../../core/data/local/api'
const serverGetSpecies = () => client.get('/species').then((r: any) => r.data)
const serverGetEcosystemRoles = () => client.get('/species/roles').then((r: any) => r.data)
const serverCreateSpecies = (data: any) => client.post('/species', data).then((r: any) => r.data)
const serverGetZones = () => client.get('/zones').then((r: any) => r.data)
const serverCreateZone = (data: any) => client.post('/zones', data).then((r: any) => r.data)

// The phone version answers from local storage; the server version calls the API. Picked when the app is built.
export const getSpecies = isLocal() ? local.getSpecies : serverGetSpecies
export const getEcosystemRoles = isLocal() ? local.getEcosystemRoles : serverGetEcosystemRoles
export const createSpecies = isLocal() ? local.createSpecies : serverCreateSpecies
export const getZones = isLocal() ? local.getZones : serverGetZones
export const createZone = isLocal() ? local.createZone : serverCreateZone
