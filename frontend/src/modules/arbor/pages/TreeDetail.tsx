import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTree, updateTree, getPhotos, uploadPhoto, getActivity } from '../api/trees'
import { useAuthStore } from '../../../core/store/auth.store'
import { ActionBadge, PriorityBadge, StatusDot } from '../components/ActionBadge'
import Spinner from '../../../core/components/Spinner'
import toast from 'react-hot-toast'
import { ArrowLeft, Camera, Activity, Edit2, CheckCircle2, MapPin, Calendar, Ruler } from 'lucide-react'

const STATUSES = ['pending', 'in_progress', 'completed', 'on_hold']

export default function TreeDetail() {
  const { code } = useParams()
  const nav = useNavigate()
  const { isOwner, isVolunteer, user } = useAuthStore()
  const [tree, setTree] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    Promise.all([getTree(code!), getPhotos(code!), getActivity(code!)])
      .then(([t, p, l]) => { setTree(t); setPhotos(p); setLogs(l) })
      .finally(() => setLoading(false))
  }, [code])

  const changeStatus = async (s: string) => {
    try {
      await updateTree(code!, { status: s, log_notes: statusNote })
      setTree((t: any) => ({ ...t, status: s }))
      toast.success(`Status → ${s.replace('_', ' ')}`)
    } catch { }
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !code) return
    setUploading(true)
    try {
      const p = await uploadPhoto(code, file, 'general')
      setPhotos(prev => [p, ...prev])
      toast.success('Photo uploaded')
    } finally { setUploading(false) }
  }

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 lg:h-[60vh] lg:bg-transparent"><Spinner label="Loading Tree Details…" /></div>
  if (!tree) return <div className="p-6 text-center text-gray-400">Tree not found</div>

  const name = tree.custom_common_name || tree.species?.common_name || 'Unknown Tree'
  const isMyTree = tree.assigned_to === user?.id || isOwner()
  const coverImage = photos.length > 0 ? photos[0].photo_url : tree.species?.image_url || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=600'

  return (
    // At lg: two columns. Left = cover, context strip, health tiles; right = one stack (instructions,
    // progress, operations, timeline, photos). The 1fr last row soaks up the taller column's extra
    // height, so both columns stack tightly. Below lg it is one column, and the order-* classes put
    // the health tiles back between progress and operations.
    <div className="min-h-screen bg-gray-50 pb-24 lg:min-h-0 lg:bg-transparent lg:pb-0 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-8 lg:gap-y-6 lg:items-start">
      {/* Immersive Cover Header */}
      <div className="relative h-72 w-full bg-forest-900 lg:col-start-1 lg:row-start-1 lg:h-80 lg:rounded-[2rem] lg:overflow-hidden">
        <img src={coverImage} alt={name} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

        {/* Top Nav */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 pt-safe">
          <button onClick={() => nav(-1)} aria-label="Go back" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-sm hover:bg-white/30 transition-colors">
            <ArrowLeft size={18} />
          </button>
          {isOwner() && (
            <button onClick={() => nav(`/trees/${code}/edit`)} aria-label="Edit tree" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-sm hover:bg-white/30 transition-colors">
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 w-full p-6 text-white text-shadow-md">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest font-bold border border-white/10 shadow-sm">
              {tree.tree_code}
            </span>
            <ActionBadge action={tree.action} />
          </div>
          <h1 className="text-4xl font-display font-bold leading-tight drop-shadow-md">{name}</h1>
          <p className="text-[13px] text-gray-300 italic mt-1">{tree.species?.scientific_name}</p>
        </div>
      </div>

      <div className="px-5 mt-6 flex flex-col gap-6 lg:contents">

        {/* Context Strip */}
        <div className="flex flex-wrap items-center gap-2.5 pb-2 lg:col-start-1 lg:row-start-2 lg:pb-0">
          <div className="bg-white px-3.5 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 whitespace-nowrap">
            <StatusDot status={tree.status} />
            <span className="text-[13px] font-bold capitalize text-gray-700">{tree.status.replace('_', ' ')}</span>
          </div>
          {tree.land_zones && (
            <div className="bg-white px-3.5 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 whitespace-nowrap">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-[13px] font-bold text-gray-700">{tree.land_zones.zone_name}</span>
            </div>
          )}
          <PriorityBadge p={tree.priority} />
        </div>

        {/* Health & Metrics Grid: left column at lg, between progress and operations below lg */}
        <div className="order-2 grid grid-cols-2 gap-4 lg:col-start-1 lg:row-start-3 lg:gap-3 xl:gap-4">
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100/30 flex flex-col justify-center items-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors border border-gray-100/50 bg-gray-50">
              <Activity size={24} className={tree.health_score < 4 ? 'text-red-500' : tree.health_score < 7 ? 'text-amber-500' : 'text-forest-500'} />
            </div>
            <p className="text-4xl font-display font-bold text-gray-900 tracking-tight mb-0.5">{tree.health_score}<span className="text-2xl text-gray-300 font-medium">/10</span></p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Health Score</p>
          </div>

          <div className="grid grid-rows-2 gap-4 lg:gap-3 xl:gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100/30 flex items-center gap-4 lg:px-3 lg:gap-3 xl:px-5 xl:gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50"><Calendar size={18} className="text-gray-400" /></div>
              <div><p className="font-display font-bold text-gray-900 text-lg">{tree.approx_age_yrs || '--'} y</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Est. Age</p></div>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100/30 flex items-center gap-4 lg:px-3 lg:gap-3 xl:px-5 xl:gap-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/50"><Ruler size={18} className="text-gray-400" /></div>
              <div><p className="font-display font-bold text-gray-900 text-lg">{tree.height_m || '--'} m</p><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Height</p></div>
            </div>
          </div>
        </div>

        {/* Right column at lg; below lg its children join the single column directly. */}
        <div className="contents lg:block lg:space-y-6 lg:col-start-2 lg:row-start-1 lg:row-span-3">

        {/* Action / Instructions */}
        {tree.action_notes && (
          <div className="order-1 bg-amber-50/80 border border-amber-200/60 rounded-[2rem] p-6 shadow-sm">
            <p className="text-[10px] font-display font-bold text-amber-700/80 uppercase tracking-widest mb-2 line-clamp-1">Field Instructions</p>
            <p className="text-[15px] font-medium text-amber-900 leading-relaxed">{tree.action_notes}</p>
          </div>
        )}

        {/* Status Update Block */}
        {isMyTree && tree.status !== 'completed' && (
          <div className="order-1 bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100/30">
            <p className="text-[11px] font-display font-bold text-gray-400 uppercase tracking-widest mb-4">Update Progress</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {STATUSES.filter(s => s !== tree.status).map(s => (
                <button key={s} onClick={() => changeStatus(s)}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-bold border transition-colors capitalize ${s === 'completed' ? 'bg-forest-600 text-white border-forest-600 shadow-md shadow-forest-200' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  {s === 'completed' && <CheckCircle2 size={16} className="inline mr-1.5" />}
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
            <input value={statusNote} onChange={e => setStatusNote(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 transition-all font-medium placeholder-gray-400"
              placeholder="Add an optional note about this update…" />
          </div>
        )}

        {/* Action Controls */}
        {!isVolunteer() && (
          <div className="order-3 bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100/30">
            <p className="text-[11px] font-display font-bold text-gray-400 uppercase tracking-widest mb-4">Tree Operations</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => nav(`/trees/${code}/activity`)}
                className="bg-forest-50 py-5 rounded-[1.5rem] flex flex-col items-center gap-2 border border-forest-100/50 hover:bg-forest-100 transition-colors shadow-sm"
              >
                <div className="bg-white p-2.5 rounded-full shadow-sm"><Activity size={18} className="text-forest-600" /></div>
                <span className="text-[11px] font-bold text-forest-700 tracking-widest uppercase mt-1">Activity Log</span>
              </button>

              <label className="bg-forest-50 py-5 rounded-[1.5rem] flex flex-col items-center gap-2 border border-forest-100/50 hover:bg-forest-100 transition-colors cursor-pointer shadow-sm">
                <div className="bg-white p-2.5 rounded-full shadow-sm"><Camera size={18} className={uploading ? 'text-gray-400' : 'text-forest-600'} /></div>
                <span className="text-[11px] font-bold text-forest-700 tracking-widest uppercase mt-1">{uploading ? 'Uploading…' : 'Add Photo'}</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} disabled={uploading} />
              </label>
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        {logs.length > 0 && (
          <div className="order-3 bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100/30 overflow-hidden">
            <p className="text-[11px] font-display font-bold text-gray-400 uppercase tracking-widest mb-6">Activity Timeline</p>
            <div className="relative border-l-2 border-forest-100 ml-3.5 space-y-7">
              {logs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="relative pl-7">
                  <div className="absolute -left-[11px] top-1 w-[20px] h-[20px] rounded-full bg-forest-500 border-[5px] border-white shadow-[0_0_0_1px_rgba(34,197,94,0.2)]" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{new Date(log.logged_at).toLocaleDateString()}</p>
                  <p className="font-display font-bold text-gray-900 text-[15px] capitalize tracking-tight">{log.action_taken.replace('_', ' ')}</p>
                  {log.notes && <p className="text-[13px] font-medium text-gray-600 mt-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 leading-relaxed shadow-inner">"{log.notes}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="order-3 mb-8 lg:mb-0">
            <p className="text-[11px] px-1 font-display font-bold text-gray-400 uppercase tracking-widest mb-4">Captured Media</p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {photos.map(p => (
                <div key={p.id} className="aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100/50 bg-gray-100">
                  <img src={p.photo_url} alt={`Photo of ${name} taken on ${p.taken_at ? new Date(p.taken_at).toLocaleDateString() : 'unknown date'}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        )}

        </div>

      </div>
    </div>
  )
}
