import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toDateStr } from '../lib/date'

const today = toDateStr(new Date())

// Fire-and-forget Supabase calls (no await needed in UI)
const sbInsert = async (table, row) => {
  try { await supabase.from(table).upsert(row) } catch (e) { console.warn(`[SB] ${table} upsert:`, e.message) }
}
const sbUpdate = async (table, id, data) => {
  try { await supabase.from(table).update(data).eq('id', id) } catch (e) { console.warn(`[SB] ${table} update:`, e.message) }
}
const sbDelete = async (table, id) => {
  try { await supabase.from(table).delete().eq('id', id) } catch (e) { console.warn(`[SB] ${table} delete:`, e.message) }
}

// Seed data (used when Supabase tables are empty)
const seedTransactions = [
  { id: '1', type: 'expense', category: 'Makan Keluarga', amount: 35000, note: 'Siang Bakso', date: today, created_at: today },
  { id: '2', type: 'expense', category: 'Transport Suami', amount: 85000, note: 'GrabRide ke Kantor', date: today, created_at: today },
  { id: '3', type: 'income', category: 'Gaji', amount: 2500000, note: 'Bonus Project', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], created_at: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { id: '4', type: 'income', category: 'Gaji', amount: 5000000, note: 'Salary Deposit', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], created_at: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
  { id: '5', type: 'expense', category: 'Makan Kantor', amount: 45000, note: 'Lunch - Bakmi GM', date: today, created_at: today },
  { id: '6', type: 'expense', category: 'Belanja Rumah', amount: 120000, note: 'Belanja bulanan', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], created_at: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
]

const seedTasks = [
  { id: '1', description: 'Pay Electricity Bill', category: 'Keuangan', is_completed: false, date: today },
  { id: '2', description: 'Morning Workout - 30min cardio', category: 'Kesehatan', is_completed: true, date: today },
  { id: '3', description: 'Submit quarterly report', category: 'Kantor', is_completed: false, date: today },
  { id: '4', description: 'Read 20 pages of Atomic Habits', category: 'Soft Skill', is_completed: true, date: today },
  { id: '5', description: 'Prepare presentation slides', category: 'Kantor', is_completed: false, date: today },
  { id: '6', description: 'Grocery shopping', category: 'Kesehatan', is_completed: false, date: today },
  { id: '7', description: 'Review budget spreadsheet', category: 'Keuangan', is_completed: true, date: today },
  { id: '8', description: 'Online course - React patterns', category: 'Soft Skill', is_completed: false, date: today },
]

const seedWeightLogs = [
  { id: '1', weight: 68.4, note: 'Feeling great today', date: today, created_at: today },
  { id: '2', weight: 68.6, note: 'High protein day', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], created_at: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { id: '3', weight: 68.5, note: 'Feeling consistent', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], created_at: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
  { id: '4', weight: 69.0, note: 'After cheat meal', date: new Date(Date.now() - 259200000).toISOString().split('T')[0], created_at: new Date(Date.now() - 259200000).toISOString().split('T')[0] },
  { id: '5', weight: 68.8, note: 'Normal day', date: new Date(Date.now() - 345600000).toISOString().split('T')[0], created_at: new Date(Date.now() - 345600000).toISOString().split('T')[0] },
  { id: '6', weight: 68.9, note: 'Started jogging', date: new Date(Date.now() - 432000000).toISOString().split('T')[0], created_at: new Date(Date.now() - 432000000).toISOString().split('T')[0] },
  { id: '7', weight: 69.1, note: 'Baseline measurement', date: new Date(Date.now() - 518400000).toISOString().split('T')[0], created_at: new Date(Date.now() - 518400000).toISOString().split('T')[0] },
]

export const useStore = create((set, get) => ({
  // Auth
  isAuthenticated: false,
  user: { id: '1', username: 'admin', password: 'admin123', name: 'LangkahKecil', avatar: '', height: 170, weightGoal: 65, weightStart: null },
  login: async (username, password) => {
    // First check Supabase profiles table
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (profile) {
        // Load profile into user state
        set({
          isAuthenticated: true,
          user: {
            id: profile.id,
            username: profile.username,
            password: profile.password,
            name: profile.name || '',
            avatar: profile.avatar || '',
            height: profile.height || 170,
            weightGoal: profile.weight_goal || 65,
            weightStart: profile.weight_start || null,
          },
        })
        get().fetchFromSupabase()
        get().subscribeRealtime()
        return true
      }
    } catch (e) {
      console.warn('[SB] profile lookup failed, using local fallback:', e.message)
    }

    // Fallback: check local user state (offline / Supabase unavailable)
    const u = get().user
    if (username === u.username && password === u.password) {
      set({ isAuthenticated: true })
      get().fetchFromSupabase()
      get().subscribeRealtime()
      return true
    }
    return false
  },
  logout: () => {
    get().unsubscribeRealtime()
    set({ isAuthenticated: false })
  },
  updateUser: (data) => {
    set((s) => ({ user: { ...s.user, ...data } }))
    // Sync profile to Supabase
    const u = get().user
    const profileRow = {
      id: u.id,
      username: u.username,
      password: u.password,
      name: u.name || '',
      avatar: u.avatar || '',
      height: u.height || 170,
      weight_goal: u.weightGoal || 65,
      weight_start: u.weightStart || null,
      updated_at: new Date().toISOString(),
    }
    // Merge any just-updated fields
    if (data.username !== undefined) profileRow.username = data.username
    if (data.password !== undefined) profileRow.password = data.password
    if (data.name !== undefined) profileRow.name = data.name
    if (data.avatar !== undefined) profileRow.avatar = data.avatar
    if (data.height !== undefined) profileRow.height = data.height
    if (data.weightGoal !== undefined) profileRow.weight_goal = data.weightGoal
    if (data.weightStart !== undefined) profileRow.weight_start = data.weightStart
    supabase.from('profiles').upsert(profileRow).catch((e) => console.warn('[SB] profile upsert:', e.message))
  },

  // Theme
  darkMode: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  // Transactions
  transactions: [...seedTransactions],
  addTransaction: (tx) => {
    const newTx = { ...tx, id: Date.now().toString(), created_at: new Date().toISOString(), user_id: get().user.id }
    set((s) => ({ transactions: [newTx, ...s.transactions] }))
    sbInsert('transactions', newTx)
  },
  updateTransaction: (id, data) => {
    set((s) => ({ transactions: s.transactions.map((t) => t.id === id ? { ...t, ...data } : t) }))
    sbUpdate('transactions', id, data)
  },
  deleteTransaction: (id) => {
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
    sbDelete('transactions', id)
  },

  // Tasks
  tasks: [...seedTasks],
  addTask: (task) => {
    const newTask = { ...task, id: Date.now().toString(), is_completed: false, date: today, user_id: get().user.id }
    set((s) => ({ tasks: [newTask, ...s.tasks] }))
    sbInsert('tasks', newTask)
  },
  updateTask: (id, data) => {
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...data } : t) }))
    sbUpdate('tasks', id, data)
  },
  toggleTask: (id) => {
    const task = get().tasks.find((t) => t.id === id)
    const newVal = !task?.is_completed
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, is_completed: newVal } : t) }))
    sbUpdate('tasks', id, { is_completed: newVal })
  },
  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    sbDelete('tasks', id)
  },

  // Weight logs
  weightLogs: [...seedWeightLogs],
  addWeightLog: (log) => {
    const newLog = { ...log, id: Date.now().toString(), created_at: new Date().toISOString(), user_id: get().user.id }
    set((s) => ({ weightLogs: [newLog, ...s.weightLogs] }))
    sbInsert('weight_logs', newLog)
  },
  updateWeightLog: (id, data) => {
    set((s) => ({ weightLogs: s.weightLogs.map((w) => w.id === id ? { ...w, ...data } : w) }))
    sbUpdate('weight_logs', id, data)
  },
  deleteWeightLog: (id) => {
    set((s) => ({ weightLogs: s.weightLogs.filter((w) => w.id !== id) }))
    sbDelete('weight_logs', id)
  },

  // Fetch from Supabase (called on login)
  isFetching: false,
  fetchFromSupabase: async () => {
    set({ isFetching: true })
    try {
      const [txRes, taskRes, wlRes, profileRes] = await Promise.all([
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('weight_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', get().user.id).single(),
      ])

      const updates = {}
      if (txRes.data && txRes.data.length > 0) updates.transactions = txRes.data
      if (taskRes.data && taskRes.data.length > 0) updates.tasks = taskRes.data
      if (wlRes.data && wlRes.data.length > 0) updates.weightLogs = wlRes.data

      // Load profile from Supabase
      if (profileRes.data) {
        const p = profileRes.data
        updates.user = {
          ...get().user,
          username: p.username,
          password: p.password,
          name: p.name || '',
          avatar: p.avatar || '',
          height: p.height || 170,
          weightGoal: p.weight_goal || 65,
          weightStart: p.weight_start || null,
        }
      }

      if (Object.keys(updates).length > 0) set(updates)
    } catch (err) {
      console.warn('[SB] fetch error:', err.message)
    } finally {
      set({ isFetching: false })
    }
  },

  // Realtime subscriptions for multi-device sync
  _realtimeChannel: null,
  subscribeRealtime: () => {
    // Unsubscribe first if already subscribed
    const existing = get()._realtimeChannel
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase
      .channel('langkahkecil-sync')
      // Transactions
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload) => {
        const row = payload.new
        set((s) => {
          if (s.transactions.some((t) => t.id === row.id)) return s // already exists (own write)
          return { transactions: [row, ...s.transactions] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transactions' }, (payload) => {
        const row = payload.new
        set((s) => ({
          transactions: s.transactions.map((t) => t.id === row.id ? { ...t, ...row } : t)
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'transactions' }, (payload) => {
        const id = payload.old?.id
        if (id) set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }))
      })
      // Tasks
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
        const row = payload.new
        set((s) => {
          if (s.tasks.some((t) => t.id === row.id)) return s
          return { tasks: [row, ...s.tasks] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
        const row = payload.new
        set((s) => ({
          tasks: s.tasks.map((t) => t.id === row.id ? { ...t, ...row } : t)
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, (payload) => {
        const id = payload.old?.id
        if (id) set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
      })
      // Weight logs
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'weight_logs' }, (payload) => {
        const row = payload.new
        set((s) => {
          if (s.weightLogs.some((w) => w.id === row.id)) return s
          return { weightLogs: [row, ...s.weightLogs] }
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'weight_logs' }, (payload) => {
        const row = payload.new
        set((s) => ({
          weightLogs: s.weightLogs.map((w) => w.id === row.id ? { ...w, ...row } : w)
        }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'weight_logs' }, (payload) => {
        const id = payload.old?.id
        if (id) set((s) => ({ weightLogs: s.weightLogs.filter((w) => w.id !== id) }))
      })
      .subscribe((status) => {
        console.log('[SB Realtime]', status)
      })

    set({ _realtimeChannel: channel })
  },

  unsubscribeRealtime: () => {
    const channel = get()._realtimeChannel
    if (channel) {
      supabase.removeChannel(channel)
      set({ _realtimeChannel: null })
    }
  },

  // Sync (manual bulk push)
  isSyncing: false,
  lastSynced: null,
  syncToSupabase: async () => {
    const state = get()
    set({ isSyncing: true })
    try {
      if (state.transactions.length > 0) {
        await supabase.from('transactions').upsert(
          state.transactions.map((t) => ({ ...t, user_id: state.user.id }))
        )
      }
      if (state.tasks.length > 0) {
        await supabase.from('tasks').upsert(
          state.tasks.map((t) => ({ ...t, user_id: state.user.id }))
        )
      }
      if (state.weightLogs.length > 0) {
        await supabase.from('weight_logs').upsert(
          state.weightLogs.map((w) => ({ ...w, user_id: state.user.id }))
        )
      }
      set({ lastSynced: new Date().toISOString() })
    } catch (err) {
      console.error('Sync failed:', err)
    } finally {
      set({ isSyncing: false })
    }
  },

  // Computed helpers
  getBalance: () => {
    const txs = get().transactions
    return txs.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0)
  },
  getTotalIncome: () => get().transactions.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0),
  getTotalExpense: () => get().transactions.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
}))
