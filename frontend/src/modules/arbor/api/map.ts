import { client } from '../../../core/api/client'
import { isLocal } from '../../../core/data/mode'
import * as local from '../../../core/data/local/api'
const serverGetMapTrees = () => client.get('/map/trees').then((r: any) => r.data)
const serverGetMapZones = () => client.get('/map/zones').then((r: any) => r.data)

// The phone version answers from local storage; the server version calls the API. Picked when the app is built.
export const getMapTrees = isLocal() ? local.getMapTrees : serverGetMapTrees
export const getMapZones = isLocal() ? local.getMapZones : serverGetMapZones
