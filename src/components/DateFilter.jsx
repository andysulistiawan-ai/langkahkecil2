import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Calendar } from 'lucide-react'
import { toDateStr } from '../lib/date'

const presets = [
  { key: '7d', label: '7 Hari', days: 7 },
  { key: '14d', label: '14 Hari', days: 14 },
  { key: '30d', label: '30 Hari', days: 30 },
  { key: 'month', label: 'Bulan Ini', days: 'month' },
  { key: 'custom', label: 'Custom', days: 'custom' },
]

function getDateRange(presetKey) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const preset = presets.find((p) => p.key === presetKey)
  if (!preset) return { start: new Date(today.getTime() - 6 * 86400000), end: today }

  if (preset.days === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return { start, end: today }
  }

  if (typeof preset.days === 'number') {
    return { start: new Date(today.getTime() - (preset.days - 1) * 86400000), end: today }
  }

  // fallback
  return { start: new Date(today.getTime() - 6 * 86400000), end: today }
}

function getLabel(activePreset, customStart, customEnd) {
  if (activePreset === 'custom' && customStart && customEnd) {
    const s = new Date(customStart + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    const e = new Date(customEnd + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    return `${s} - ${e}`
  }
  return presets.find((p) => p.key === activePreset)?.label || '7 Hari'
}

export default function DateFilter({ defaultPreset = '7d', onChange }) {
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState(defaultPreset)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Notify parent for non-custom presets only
  useEffect(() => {
    if (activePreset === 'custom') return // custom waits for Apply button
    const { start, end } = getDateRange(activePreset)
    onChange?.({
      preset: activePreset,
      startDate: toDateStr(start),
      endDate: toDateStr(end),
      label: getLabel(activePreset, '', ''),
    })
  }, [activePreset])

  const selectPreset = (key) => {
    setActivePreset(key)
    if (key !== 'custom') {
      setOpen(false)
    }
  }

  const applyCustom = () => {
    if (customStart && customEnd && customStart <= customEnd) {
      onChange?.({
        preset: 'custom',
        startDate: customStart,
        endDate: customEnd,
        label: getLabel('custom', customStart, customEnd),
      })
      setOpen(false)
    }
  }

  const label = getLabel(activePreset, customStart, customEnd)

  return (
    <div className="relative" ref={ref}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-high dark:bg-[#2a2a2a] text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] hover:bg-surface-highest dark:hover:bg-[#353534] transition-colors"
      >
        <Calendar className="w-3.5 h-3.5" />
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-[#1c1b1b] rounded-xl shadow-elevated border border-surface-high dark:border-[#27272a] overflow-hidden">
          <div className="p-2 space-y-1">
            {presets.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => selectPreset(key)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activePreset === key
                    ? 'bg-primary-container/10 dark:bg-[#00add0]/10 text-primary-container dark:text-[#00add0]'
                    : 'text-[#3d494d] dark:text-[#bcc8ce] hover:bg-surface-low dark:hover:bg-[#2a2a2a]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {activePreset === 'custom' && (
            <div className="p-3 border-t border-surface-high dark:border-[#27272a] space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#6d797e] dark:text-[#869398] uppercase tracking-wider mb-1">From</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="input-field text-xs py-2 min-h-[36px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#6d797e] dark:text-[#869398] uppercase tracking-wider mb-1">To</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="input-field text-xs py-2 min-h-[36px]"
                />
              </div>
              <button
                onClick={applyCustom}
                disabled={!customStart || !customEnd}
                className="w-full py-2 rounded-lg bg-primary-container dark:bg-[#00add0] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
