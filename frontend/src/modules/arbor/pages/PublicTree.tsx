import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicTree } from '../api/trees'
import Spinner from '../../../core/components/Spinner'
import { Leaf, Heart } from 'lucide-react'

const ROLE_ICONS: Record<string,string> = {
  fruit_bearer:'🍎', shade_provider:'🌿', nitrogen_fixer:'🌱',
  pollinator_attractor:'🐝', carbon_sequester:'🌍', habitat_provider:'🐦',
  soil_stabilizer:'🪨', water_retention:'💧', medicinal:'⚕️',
  edible:'🥬', aromatic:'👃', pest_repellent:'🛡️', deep_rooter:'🌳', windbreak:'💨'
}

export default function PublicTreePage() {
  const { code } = useParams()
  const [tree, setTree] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(false)
  useEffect(() => { getPublicTree(code!).then(setTree).catch(() => setErr(true)).finally(() => setLoading(false)) }, [code])
  if (loading) return <Spinner label="Loading tree info…" />
  if (err || !tree) return (
    <div className="min-h-screen bg-forest-50 flex items-center justify-center">
      <div className="text-center p-8"><p className="text-4xl mb-3">🌲</p><p className="font-semibold text-gray-700">Tree not found</p><p className="text-sm text-gray-400 mt-1">Code: {code}</p></div>
    </div>
  )
  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-800 to-forest-600 lg:pb-12">
      <div className="px-6 pt-12 pb-8 text-white lg:max-w-3xl lg:mx-auto lg:px-8 lg:pt-16 lg:pb-10">
        <p className="text-forest-300 text-sm font-mono mb-1">{tree.code}</p>
        <h1 className="text-3xl font-bold">{tree.name}</h1>
        <p className="italic text-forest-200 mt-0.5">{tree.species}</p>
        {tree.zone && <p className="text-forest-300 text-sm mt-1">📍 {tree.zone}</p>}
      </div>
      <div className="bg-gray-50 rounded-t-3xl min-h-screen px-4 pt-6 pb-12 space-y-4 lg:max-w-3xl lg:mx-auto lg:min-h-0 lg:rounded-3xl lg:px-8 lg:pt-8 lg:pb-8 lg:shadow-xl">
        {tree.funFact && (
          <div className="bg-forest-50 border border-forest-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-forest-700 uppercase mb-1">✨ Did you know?</p>
            <p className="text-sm text-gray-700">{tree.funFact}</p>
          </div>
        )}
        {tree.description && <div className="bg-white rounded-2xl p-4 shadow-sm"><p className="text-sm text-gray-600">{tree.description}</p></div>}
        <div className="grid grid-cols-3 gap-3">
          {tree.age && <div className="bg-white rounded-2xl p-3 text-center shadow-sm"><p className="text-2xl font-bold text-forest-600">{tree.age}</p><p className="text-xs text-gray-400">Years old</p></div>}
          {tree.height && <div className="bg-white rounded-2xl p-3 text-center shadow-sm"><p className="text-2xl font-bold text-forest-600">{tree.height}m</p><p className="text-xs text-gray-400">Height</p></div>}
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm"><p className="text-lg font-bold text-forest-600 capitalize">{tree.status?.replace('_',' ')}</p><p className="text-xs text-gray-400">Status</p></div>
        </div>
        {tree.ecosystemRoles?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1"><Leaf size={12} /> Ecosystem Roles</p>
            <div className="flex flex-wrap gap-2">
              {tree.ecosystemRoles.map((r: string) => (
                <span key={r} className="text-xs bg-forest-50 text-forest-700 border border-forest-200 px-2 py-1 rounded-full">{ROLE_ICONS[r]||'🌿'} {r.replace(/_/g,' ')}</span>
              ))}
            </div>
          </div>
        )}
        {tree.edibleParts && <div className="bg-white rounded-2xl p-4 shadow-sm"><p className="text-xs font-semibold text-gray-500 uppercase mb-2">🍃 Edible Parts</p><p className="text-sm text-gray-600">{tree.edibleParts}</p></div>}
        {tree.publicNotes && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4"><p className="text-xs font-semibold text-amber-700 uppercase mb-1">📋 Notes</p><p className="text-sm text-gray-700">{tree.publicNotes}</p></div>}
        {tree.contributors?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1"><Heart size={12} /> People Connected</p>
            {tree.contributors.map((c: any, i: number) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold text-sm flex-shrink-0">{c.person.name[0]}</div>
                <div><p className="font-medium text-sm text-gray-800">{c.person.name}</p><p className="text-xs text-forest-600 capitalize">{c.role}</p>{c.person.bio && <p className="text-xs text-gray-500 mt-0.5">{c.person.bio}</p>}</div>
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-gray-300 pt-4">Private land management project</p>
      </div>
    </div>
  )
}
