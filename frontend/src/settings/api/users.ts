import { client } from '../../core/api/client'
import { isLocal } from '../../core/data/mode'
import * as local from '../../core/data/local/api'
const serverGetUsers = () => client.get('/users').then((r: any) => r.data)
const serverCreateUser = (data: any) => client.post('/users', data).then((r: any) => r.data)
const serverUpdateUser = (id: number, data: any) => client.patch(`/users/${id}`, data).then((r: any) => r.data)
const serverDeactivateUser = (id: number) => client.delete(`/users/${id}`).then((r: any) => r.data)

// The phone version answers from local storage; the server version calls the API. Picked when the app is built.
export const getUsers = isLocal() ? local.getUsers : serverGetUsers
export const createUser = isLocal() ? local.createUser : serverCreateUser
export const updateUser = isLocal() ? local.updateUser : serverUpdateUser
export const deactivateUser = isLocal() ? local.deactivateUser : serverDeactivateUser
