import { Sun, Moon } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Header() {
  const { user, darkMode, toggleDarkMode } = useStore()

  return (
    <header className="sticky top-0 z-30 bg-surface dark:bg-[#131313] px-4 py-3 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="text-lg font-bold text-primary dark:text-[#53d6fa] tracking-tight">
            {user.name}
          </h1>
        </div>
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-high dark:hover:bg-[#2a2a2a] transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-[#53d6fa]" />
          ) : (
            <Moon className="w-5 h-5 text-[#3d494d]" />
          )}
        </button>
      </div>
    </header>
  )
}
