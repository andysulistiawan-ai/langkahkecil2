import { useState } from 'react'
import { useStore } from '../store/useStore'
import { LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const login = useStore((s) => s.login)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const success = await login(username, password)
      if (!success) {
        setError('Invalid username or password')
      }
    } catch {
      setError('Connection error, try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-[#131313] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center">
            <span className="text-3xl font-extrabold text-white">LK</span>
          </div>
          <h1 className="text-2xl font-bold text-[#191c1d] dark:text-white">LangkahKecil</h1>
          <p className="text-sm text-[#6d797e] dark:text-[#869398] mt-1">Your personal multi-tracker</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-12"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d797e] dark:text-[#869398]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-elevated disabled:opacity-50"
          >
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-[#6d797e] dark:text-[#869398] mt-6">
          Default: admin / admin123
        </p>
      </div>
    </div>
  )
}
