import { client } from './client'
import { isLocal } from '../data/mode'
import * as local from '../data/local/api'
const serverLogin = (email: string, password: string) =>
  client.post('/auth/login', { email, password }).then((r: any) => r.data)
const serverChangePassword = (currentPassword: string, newPassword: string) =>
  client.post('/auth/change-password', { currentPassword, newPassword }).then((r: any) => r.data)
const serverGetMe = () => client.get('/users/me').then((r: any) => r.data)

// The phone version answers from local storage; the server version calls the API. Picked when the app is built.
export const login = isLocal() ? local.login : serverLogin
export const changePassword = isLocal() ? local.changePassword : serverChangePassword
export const getMe = isLocal() ? local.getMe : serverGetMe
