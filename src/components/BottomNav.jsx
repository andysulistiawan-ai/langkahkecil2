import { NavLink } from 'react-router-dom'
import { Home, Wallet, Scale, CheckSquare } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
  { to: '/weight', icon: Scale, label: 'Weight' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1c1b1b] border-t border-surface-high dark:border-[#27272a] nav-safe-area">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-container dark:text-[#00add0]'
                  : 'text-[#6d797e] dark:text-[#869398] hover:text-primary dark:hover:text-[#53d6fa]'
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
