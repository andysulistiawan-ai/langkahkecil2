import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => document.body.classList.remove('modal-open')
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pb-20 sm:pb-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1b1b] rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#191c1d] dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-high dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="w-5 h-5 text-[#6d797e] dark:text-[#869398]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
