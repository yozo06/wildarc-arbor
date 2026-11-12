import toast from 'react-hot-toast'
import * as farm from './farm'
import * as logs from './logs'
import * as owner from './owner'
import * as photos from './photos'
import { fail } from './errors'
import { notifyFarmChanged } from '../../phone/farmEvents'

// Everything the screens call, answered on the phone. Like the server's axios client, a failure shows a
// toast and then rejects, because some screens rely on the toast and have no catch of their own.

function withToast<A extends unknown[], R>(fn: (...args: A) => Promise<R>, changesFarm = false) {
  return async (...args: A): Promise<R> => {
    try {
      const result = await fn(...args)
      if (changesFarm) notifyFarmChanged()
      return result
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Something went wrong')
      throw err
    }
  }
}

const NOT_ON_PHONE = 'Not available on the phone version'

export const getPublicTree = withToast(farm.getPublicTree)
export const getTrees = withToast(farm.getTrees)
export const getTree = withToast(farm.getTree)
export const createTree = withToast(farm.createTree, true)
export const updateTree = withToast(farm.updateTree, true)
export const deleteTree = withToast(farm.deleteTree, true)
export const getSpecies = withToast(farm.getSpecies)
export const getEcosystemRoles = withToast(farm.getEcosystemRoles)
export const createSpecies = withToast(farm.createSpecies, true)
export const getZones = withToast(farm.getZones)
export const createZone = withToast(farm.createZone, true)
export const getMapTrees = withToast(farm.getMapTrees)
export const getMapZones = withToast(farm.getMapZones)
export const getDashboardStats = withToast(farm.getDashboardStats)

export const getActivity = withToast(logs.getActivity)
export const addActivity = withToast(logs.addActivity, true)
export const getHealth = withToast(logs.getHealth)
export const addHealth = withToast(logs.addHealth, true)
export const getContributors = withToast(logs.getContributors)
export const addContributor = withToast(logs.addContributor)

export const getPhotos = withToast(photos.getPhotos)
export const uploadPhoto = withToast(photos.uploadPhoto, true)

export const getUsers = withToast(owner.getUsers)
export const createUser = withToast(owner.createUser)
export const updateUser = withToast(owner.updateUser, true)
export const deactivateUser = withToast(owner.deactivateUser)
export const getMe = withToast(owner.getMe)
export const login = withToast(async (_email: string, _password: string) => fail(400, NOT_ON_PHONE))
export const changePassword = withToast(async (_current: string, _next: string) => fail(400, NOT_ON_PHONE))
