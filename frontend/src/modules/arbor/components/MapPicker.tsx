import { useEffect, useRef, useState } from 'react'
import { CANVAS_COLORS } from '../../../core/constants/actionColors'

interface MapTree { id: number; tree_code: string; coord_x?: number; coord_y?: number; action: string }

export default function MapPicker({ trees, value, onChange }: {
    trees: MapTree[]; value?: { x: number; y: number }; onChange: (x: number, y: number) => void
}) {
    const ref = useRef<HTMLCanvasElement>(null)

    // Hardcoded bounds for the land (can be improved to use zone boundaries)
    const minX = 0, maxX = 100, minY = 0, maxY = 100

    const toCanvas = (x: number, y: number, W: number, H: number) => {
        const pad = 20
        return [
            pad + ((x - minX) / (maxX - minX || 1)) * (W - pad * 2),
            H - pad - ((y - minY) / (maxY - minY || 1)) * (H - pad * 2)
        ] as [number, number]
    }

    const fromCanvas = (cx: number, cy: number, W: number, H: number) => {
        const pad = 20
        return [
            minX + ((cx - pad) / (W - pad * 2)) * (maxX - minX),
            minY + ((H - cy - pad) / (H - pad * 2)) * (maxY - minY)
        ] as [number, number]
    }

    useEffect(() => {
        const canvas = ref.current; if (!canvas) return
        const ctx = canvas.getContext('2d')!
        const W = canvas.offsetWidth, H = canvas.offsetHeight
        canvas.width = W; canvas.height = H
        ctx.clearRect(0, 0, W, H)

        // Draw Grid
        ctx.strokeStyle = CANVAS_COLORS.gridStrokeLight; ctx.lineWidth = 1
        for (let i = 0; i <= 10; i++) {
            const gx = 20 + (i / 10) * (W - 40); ctx.beginPath(); ctx.moveTo(gx, 20); ctx.lineTo(gx, H - 20); ctx.stroke()
            const gy = 20 + (i / 10) * (H - 40); ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(W - 20, gy); ctx.stroke()
        }

        // Draw Existing Trees (Subtle)
        trees.filter(t => t.coord_x != null).forEach(t => {
            const [cx, cy] = toCanvas(t.coord_x!, t.coord_y!, W, H)
            ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fillStyle = CANVAS_COLORS.existingTreeDot; ctx.fill()
        })

        // Draw Current Selection
        if (value) {
            const [cx, cy] = toCanvas(value.x, value.y, W, H)
            ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fillStyle = CANVAS_COLORS.newTreeMarker; ctx.fill()
            ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke()
            ctx.fillStyle = CANVAS_COLORS.newTreeMarker; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'
            ctx.fillText('NEW TREE', cx, cy - 12)
        }
    }, [trees, value])

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = ref.current!; const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left, my = e.clientY - rect.top
        const [x, y] = fromCanvas(mx, my, canvas.width, canvas.height)
        onChange(Math.round(x * 100) / 100, Math.round(y * 100) / 100)
    }

    return (
        <div className="w-full h-64 lg:h-96 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden relative cursor-crosshair">
            <canvas ref={ref} className="w-full h-full" onClick={handleClick} />
            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] text-gray-400 font-mono shadow-sm pointer-events-none">
                Tap to set coordinates
            </div>
        </div>
    )
}
