import { getStore } from './store'
import { fail } from './errors'

// The phone version has one person: whoever holds the phone, who owns the farm. They are user 1, so the
// role checks the screens already make ("is this the owner?", "is this tree assigned to me?") still work.

export const LOCAL_OWNER_ID = 1

export interface LocalOwner {
  id: 1
  name: string
  email: ''
  role: 'owner'
  phone: string | null
  bio: string | null
  is_active: true
  created_at: string
}

const NOT_ON_PHONE = 'Not available in this version'

export async function getOwner(): Promise<LocalOwner> {
  const store = await getStore()
  const saved = await store.get<LocalOwner & { key: string }>('meta', 'owner')
  if (saved) {
    const { key: _key, ...owner } = saved
    return owner
  }
  const owner: LocalOwner = {
    id: LOCAL_OWNER_ID, name: 'You', email: '', role: 'owner', phone: null, bio: null, is_active: true,
    created_at: new Date().toISOString(),
  }
  await store.put('meta', { key: 'owner', ...owner })
  return owner
}

export async function getUsers() {
  return [await getOwner()]
}

export async function getMe() {
  return getOwner()
}

/** Like the server: name, phone and bio change only when the form sends a value; the role never does. */
export async function updateUser(id: number, data: Record<string, unknown>) {
  if (Number(id) !== LOCAL_OWNER_ID) fail(403, 'You can only edit your own profile')
  const owner = await getOwner()
  const next: LocalOwner = { ...owner }
  for (const f of ['name', 'phone', 'bio'] as const) if (data?.[f]) next[f] = String(data[f])
  await (await getStore()).put('meta', { key: 'owner', ...next })
  return next
}

export async function createUser(_data?: unknown): Promise<never> {
  return fail(400, NOT_ON_PHONE)
}

export async function deactivateUser(_id?: number): Promise<never> {
  return fail(400, NOT_ON_PHONE)
}
