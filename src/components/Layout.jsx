import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import Header from './Header'
import BottomNav from './BottomNav'

export default function Layout({ children }) {
  const darkMode = useStore((s) => s.darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-surface dark:bg-[#131313] transition-colors duration-200">
      <Header />
      <main className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
