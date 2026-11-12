import toast from 'react-hot-toast'
import * as farm from './farm'
import * as logs from './logs'
import * as owner from './owner'
import { fail } from './errors'

// Everything the screens call, answered on the phone. Like the server's axios client, a failure shows a
// toast and then rejects, because some screens rely on the toast and have no catch of their own.

function withToast<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  return async (...args: A): Promise<R> => {
    try {
      return await fn(...args)
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
export const createTree = withToast(farm.createTree)
export const updateTree = withToast(farm.updateTree)
export const deleteTree = withToast(farm.deleteTree)
export const getSpecies = withToast(farm.getSpecies)
export const getEcosystemRoles = withToast(farm.getEcosystemRoles)
export const createSpecies = withToast(farm.createSpecies)
export const getZones = withToast(farm.getZones)
export const createZone = withToast(farm.createZone)
export const getMapTrees = withToast(farm.getMapTrees)
export const getMapZones = withToast(farm.getMapZones)
export const getDashboardStats = withToast(farm.getDashboardStats)

export const getActivity = withToast(logs.getActivity)
export const addActivity = withToast(logs.addActivity)
export const getHealth = withToast(logs.getHealth)
export const addHealth = withToast(logs.addHealth)
export const getContributors = withToast(logs.getContributors)
export const addContributor = withToast(logs.addContributor)

// Photos arrive in a later step of this branch; until then the tree page shows none.
export const getPhotos = withToast(async (_code: string) => [] as any[])
export const uploadPhoto = withToast(async (_code: string, _file: File, _type: string, _caption?: string) =>
  fail(400, 'Photos come in a later step'))

export const getUsers = withToast(owner.getUsers)
export const createUser = withToast(owner.createUser)
export const updateUser = withToast(owner.updateUser)
export const deactivateUser = withToast(owner.deactivateUser)
export const getMe = withToast(owner.getMe)
export const login = withToast(async (_email: string, _password: string) => fail(400, NOT_ON_PHONE))
export const changePassword = withToast(async (_current: string, _next: string) => fail(400, NOT_ON_PHONE))
