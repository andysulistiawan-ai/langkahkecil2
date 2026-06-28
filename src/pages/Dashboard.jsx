import { useState, useEffect, useRef, useMemo } from 'react'
import { useStore } from '../store/useStore'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import {
  History, RefreshCw, Timer, Settings,
  Wallet, Scale, CheckSquare, Eye, EyeOff,
  UtensilsCrossed, Dumbbell, ClipboardList,
  TrendingDown, TrendingUp, X, Camera, User, Play, Pause, RotateCcw, Save,
  CheckCircle2, XCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

// Focus Timer Modal
function FocusTimerModal({ isOpen, onClose }) {
  const [time, setTime] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && time > 0) {
      intervalRef.current = setInterval(() => setTime((t) => t - 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, time])

  const mins = Math.floor(time / 60).toString().padStart(2, '0')
  const secs = (time % 60).toString().padStart(2, '0')

  const reset = () => { setTime(25 * 60); setRunning(false) }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Focus Timer">
      <div className="flex flex-col items-center py-6">
        <div className="w-48 h-48 rounded-full border-4 border-primary-container dark:border-[#00add0] flex items-center justify-center mb-6">
          <span className="text-5xl font-bold text-[#191c1d] dark:text-white tabular-nums">{mins}:{secs}</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setRunning(!running)} className="w-14 h-14 rounded-full bg-primary-container dark:bg-[#00add0] text-white flex items-center justify-center shadow-lg">
            {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={reset} className="w-14 h-14 rounded-full bg-surface-high dark:bg-[#2a2a2a] text-[#6d797e] dark:text-[#869398] flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2 mt-6">
          {[15, 25, 45, 60].map((m) => (
            <button key={m} onClick={() => { setTime(m * 60); setRunning(false) }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce] hover:bg-primary-container hover:text-white dark:hover:bg-[#00add0] dark:hover:text-white transition-colors">
              {m}m
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}

// Settings Modal
function SettingsModal({ isOpen, onClose }) {
  const { user, updateUser } = useStore()
  const [name, setName] = useState(user.name)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    // If any credential field is filled, validate old password
    if (newUsername || newPassword) {
      if (!oldPassword) {
        setError('Old password is required')
        return
      }
      if (oldPassword !== user.password) {
        setError('Old password is incorrect')
        return
      }
    }

    const updates = { name, avatar: avatarUrl }
    if (newUsername) updates.username = newUsername
    if (newPassword) updates.password = newPassword

    updateUser(updates)
    // Reset credential fields
    setNewUsername('')
    setNewPassword('')
    setOldPassword('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-8 h-8" />}
          </div>
          <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider">Avatar URL</label>
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="input-field text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Display Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>

        {/* Change Credentials */}
        <div className="border-t border-surface-high dark:border-[#27272a] pt-4">
          <p className="text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-3">Change Login Credentials</p>
          <p className="text-[10px] text-[#6d797e] dark:text-[#869398] mb-3">Leave blank to keep current username & password</p>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6d797e] dark:text-[#869398] mb-1">New Username</label>
              <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="input-field text-sm" placeholder={user.username} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6d797e] dark:text-[#869398] mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field text-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6d797e] dark:text-[#869398] mb-1">Old Password <span className="text-red-500">*</span></label>
              <input type="password" value={oldPassword} onChange={(e) => { setOldPassword(e.target.value); setError('') }} className="input-field text-sm" placeholder="Required to save changes" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500 font-semibold mt-2">{error}</p>}
        </div>

        <button onClick={handleSave} className="w-full py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </Modal>
  )
}

export default function Dashboard() {
  const store = useStore()
  const navigate = useNavigate()
  const [showBalance, setShowBalance] = useState(true)
  const [timerOpen, setTimerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [weightModalOpen, setWeightModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null) // null | 'checking' | 'connected' | 'failed'

  const handleSync = async () => {
    setSyncStatus('checking')
    try {
      // Test connection by querying each table
      const { error } = await supabase.from('transactions').select('id').limit(1)
      if (error) throw error
      // Connection OK — run sync
      await store.syncToSupabase()
      setSyncStatus('connected')
    } catch (err) {
      console.warn('[Sync] connection check failed:', err.message)
      setSyncStatus('failed')
    }
    // Auto-dismiss after 3 seconds
    setTimeout(() => setSyncStatus(null), 3000)
  }

  const balance = store.getBalance()
  const currentWeight = store.weightLogs[0]?.weight || 0
  const prevWeight = store.weightLogs[1]?.weight || currentWeight
  const weightDiff = (currentWeight - prevWeight).toFixed(1)
  const goalProgress = store.user.weightGoal
    ? Math.min(100, Math.round(((74 - currentWeight) / (74 - store.user.weightGoal)) * 100))
    : 0

  const todayTasks = store.tasks.filter((t) => t.date === new Date().toISOString().split('T')[0])
  const upcomingCount = todayTasks.filter((t) => !t.is_completed).length
  const taskCategories = [...new Set(todayTasks.filter((t) => !t.is_completed).map((t) => t.category))]

  // Recent activity - merge all data sources (reactive to store changes)
  const recentActivity = useMemo(() => {
    const all = [
      ...store.transactions.map((t) => ({
        id: `tx-${t.id}`, type: 'transaction', icon: t.type === 'income' ? Wallet : UtensilsCrossed,
        title: t.note, subtitle: t.date, value: t.type === 'income' ? `+${formatRupiah(t.amount)}` : `-${formatRupiah(t.amount)}`,
        valueColor: t.type === 'income' ? 'text-primary-container dark:text-[#00add0]' : 'text-tertiary dark:text-[#ffb86c]',
        badge: t.category, badgeColor: 'bg-tertiary-fixed dark:bg-[#2a2a2a] text-tertiary dark:text-[#ffb86c]',
        sortDate: t.created_at || t.date
      })),
      ...store.tasks.map((t) => ({
        id: `task-${t.id}`, type: 'task', icon: CheckSquare,
        title: t.description, subtitle: t.date, value: t.is_completed ? 'Done' : 'Pending',
        valueColor: t.is_completed ? 'text-secondary dark:text-[#44e2cd]' : 'text-[#6d797e] dark:text-[#869398]',
        badge: t.category, badgeColor: 'bg-secondary-fixed dark:bg-[#2a2a2a] text-secondary dark:text-[#44e2cd]',
        sortDate: t.created_at || t.date
      })),
      ...store.weightLogs.map((w) => ({
        id: `wt-${w.id}`, type: 'weight', icon: Dumbbell,
        title: w.note, subtitle: w.date, value: `${w.weight} kg`,
        valueColor: 'text-secondary dark:text-[#44e2cd]',
        badge: 'Health', badgeColor: 'bg-secondary-fixed dark:bg-[#2a2a2a] text-secondary dark:text-[#44e2cd]',
        sortDate: w.created_at || w.date
      })),
    ]
    // Sort by most recent first, take top 5
    return all.sort((a, b) => String(b.sortDate).localeCompare(String(a.sortDate))).slice(0, 5)
  }, [store.transactions, store.tasks, store.weightLogs])

  // Quick Add Expense Modal
  const [expForm, setExpForm] = useState({ amount: '', note: '', category: 'Makan Keluarga' })
  const handleAddExpense = () => {
    if (!expForm.amount) return
    store.addTransaction({ type: 'expense', amount: Number(expForm.amount), note: expForm.note, category: expForm.category, date: new Date().toISOString().split('T')[0] })
    setExpForm({ amount: '', note: '', category: 'Makan' })
    setExpenseModalOpen(false)
  }

  // Quick Add Weight Modal
  const [wtForm, setWtForm] = useState({ weight: '', note: '' })
  const handleAddWeight = () => {
    if (!wtForm.weight) return
    store.addWeightLog({ weight: Number(wtForm.weight), note: wtForm.note, date: new Date().toISOString().split('T')[0] })
    setWtForm({ weight: '', note: '' })
    setWeightModalOpen(false)
  }

  // Quick Add Task Modal
  const [taskForm, setTaskForm] = useState({ description: '', category: 'Kantor' })
  const handleAddTask = () => {
    if (!taskForm.description) return
    store.addTask({ description: taskForm.description, category: taskForm.category, date: new Date().toISOString().split('T')[0] })
    setTaskForm({ description: '', category: 'Kantor' })
    setTaskModalOpen(false)
  }

  return (
    <Layout>
      {/* Financial Balance Card */}
      <div className="card mb-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?w=600')] bg-cover bg-center" />
        <div className="relative z-10">
          <p className="text-xs font-semibold text-[#6d797e] dark:text-[#869398] uppercase tracking-wider mb-1">Financial Balance</p>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-3xl font-extrabold text-primary-container dark:text-[#53d6fa] tracking-tight">
              {showBalance ? formatRupiah(balance) : '••••••'}
            </h2>
            <button onClick={() => setShowBalance(!showBalance)} className="text-[#6d797e] dark:text-[#869398]">
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* 4 Action Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: History, label: 'History', action: () => navigate('/finance') },
              { icon: RefreshCw, label: 'Sync', action: handleSync, spinning: store.isSyncing || syncStatus === 'checking' },
              { icon: Timer, label: 'Focus Timer', action: () => setTimerOpen(true) },
              { icon: Settings, label: 'Settings', action: () => setSettingsOpen(true) },
            ].map(({ icon: Icon, label, action, spinning }) => (
              <button key={label} onClick={action}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-surface-low dark:bg-[#201f1f] hover:bg-surface-high dark:hover:bg-[#2a2a2a] transition-colors">
                <Icon className={`w-5 h-5 text-primary-container dark:text-[#00add0] ${spinning ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-semibold text-[#3d494d] dark:text-[#bcc8ce]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add Cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <button onClick={() => setExpenseModalOpen(true)}
          className="card flex flex-col items-center gap-2 py-5 hover:shadow-elevated transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 dark:bg-[#00add0]/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-container dark:text-[#00add0]" />
          </div>
          <span className="text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce]">Add Expense</span>
        </button>
        <button onClick={() => setWeightModalOpen(true)}
          className="card flex flex-col items-center gap-2 py-5 hover:shadow-elevated transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 dark:bg-[#44e2cd]/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-secondary dark:text-[#44e2cd]" />
          </div>
          <span className="text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce]">Add Weight</span>
        </button>
        <button onClick={() => setTaskModalOpen(true)}
          className="card flex flex-col items-center gap-2 py-5 hover:shadow-elevated transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-tertiary/10 dark:bg-[#ffb86c]/10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-tertiary dark:text-[#ffb86c]" />
          </div>
          <span className="text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce]">New Task</span>
        </button>
      </div>

      {/* Weight + Tasks Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Weight Card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 dark:bg-[#44e2cd]/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-secondary dark:text-[#44e2cd]" />
            </div>
            <span className="text-xs font-semibold text-[#6d797e] dark:text-[#869398]">Weight</span>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            {Number(weightDiff) < 0 ? (
              <TrendingDown className="w-4 h-4 text-secondary dark:text-[#44e2cd]" />
            ) : (
              <TrendingUp className="w-4 h-4 text-tertiary dark:text-[#ffb86c]" />
            )}
            <span className={`text-xs font-semibold ${Number(weightDiff) < 0 ? 'text-secondary dark:text-[#44e2cd]' : 'text-tertiary dark:text-[#ffb86c]'}`}>
              {weightDiff > 0 ? '+' : ''}{weightDiff}kg
            </span>
          </div>
          <p className="text-xl font-bold text-[#191c1d] dark:text-white mb-2">{currentWeight} kg</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#6d797e] dark:text-[#869398]">Goal: {goalProgress}kg</span>
            <div className="flex-1 h-1.5 bg-surface-high dark:bg-[#2a2a2a] rounded-full overflow-hidden">
              <div className="h-full bg-secondary dark:bg-[#44e2cd] rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, goalProgress))}%` }} />
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-tertiary/10 dark:bg-[#ffb86c]/10 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-tertiary dark:text-[#ffb86c]" />
            </div>
            <span className="text-xs font-semibold text-[#6d797e] dark:text-[#869398]">Tasks</span>
          </div>
          <p className="text-xl font-bold text-[#191c1d] dark:text-white mb-2">{upcomingCount} upcoming</p>
          <div className="flex gap-1.5 flex-wrap mb-2">
            {taskCategories.slice(0, 4).map((cat, i) => {
              const colors = ['bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400']
              return (
                <span key={cat} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${colors[i % colors.length]}`}>
                  {cat.charAt(0)}
                </span>
              )
            })}
            {taskCategories.length > 4 && (
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                +{taskCategories.length - 4}
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#6d797e] dark:text-[#869398] truncate">
            Next: {todayTasks.find((t) => !t.is_completed)?.description || 'All done!'}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#191c1d] dark:text-white">Recent Activity</h3>
          <button onClick={() => navigate('/finance')} className="text-xs font-semibold text-primary-container dark:text-[#00add0]">See All</button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-surface-high dark:border-[#27272a] last:border-0">
              <div className="w-10 h-10 rounded-xl bg-surface-low dark:bg-[#201f1f] flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary-container dark:text-[#00add0]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#191c1d] dark:text-white truncate">{item.title}</p>
                <p className="text-[10px] text-[#6d797e] dark:text-[#869398]">{item.subtitle}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${item.valueColor}`}>{item.value}</p>
                <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <FocusTimerModal isOpen={timerOpen} onClose={() => setTimerOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Quick Add Expense Modal */}
      <Modal isOpen={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add Expense">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Amount</label>
            <input type="number" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} className="input-field" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Category</label>
            <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} className="input-field">
              {['Makan Keluarga', 'Makan Kantor', 'Jajan Suami', 'Jajan Istri', 'Jajan Adik', 'Belanja Rumah', 'Hiburan', 'Kesehatan', 'Transport Suami', 'Transport Istri'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Note</label>
            <input value={expForm.note} onChange={(e) => setExpForm({ ...expForm, note: e.target.value })} className="input-field" placeholder="Description..." />
          </div>
          <button onClick={handleAddExpense} className="w-full py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold">Save</button>
        </div>
      </Modal>

      {/* Quick Add Weight Modal */}
      <Modal isOpen={weightModalOpen} onClose={() => setWeightModalOpen(false)} title="Add Weight">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Weight (kg)</label>
            <input type="number" step="0.1" value={wtForm.weight} onChange={(e) => setWtForm({ ...wtForm, weight: e.target.value })} className="input-field" placeholder="68.5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Note</label>
            <input value={wtForm.note} onChange={(e) => setWtForm({ ...wtForm, note: e.target.value })} className="input-field" placeholder="e.g., Makan malam karbo" />
          </div>
          <button onClick={handleAddWeight} className="w-full py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold">Save</button>
        </div>
      </Modal>

      {/* Quick Add Task Modal */}
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Add New Task">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {['Kantor', 'Kesehatan', 'Keuangan', 'Soft Skill'].map((cat) => (
                <button key={cat} onClick={() => setTaskForm({ ...taskForm, category: cat })}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${taskForm.category === cat ? 'bg-primary-container dark:bg-[#00add0] text-white' : 'bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce]'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">What do you want to do?</label>
            <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="input-field min-h-[100px] resize-none" placeholder="Write task description here..." />
          </div>
          <button onClick={handleAddTask} className="w-full py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold">Save</button>
        </div>
      </Modal>

      {/* Sync Status Toast */}
      {syncStatus && syncStatus !== 'checking' && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg backdrop-blur-sm animate-slide-up ${
          syncStatus === 'connected'
            ? 'bg-green-500/95 text-white'
            : 'bg-red-500/95 text-white'
        }`}>
          {syncStatus === 'connected'
            ? <CheckCircle2 className="w-5 h-5" />
            : <XCircle className="w-5 h-5" />
          }
          <div>
            <p className="text-sm font-bold">
              {syncStatus === 'connected' ? 'Database Connected' : 'Failed to Connect'}
            </p>
            <p className="text-[10px] opacity-80">
              {syncStatus === 'connected' ? 'All data synced to Supabase' : 'Check your connection and try again'}
            </p>
          </div>
        </div>
      )}
    </Layout>
  )
}
