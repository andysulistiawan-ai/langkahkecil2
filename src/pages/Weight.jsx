import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, TrendingDown, TrendingUp, Target } from 'lucide-react'
import DateFilter from '../components/DateFilter'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

export default function Weight() {
  const store = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '', note: '' })
  const [bmiHeight, setBmiHeight] = useState(store.user?.height || 170)
  const [bmiWeight, setBmiWeight] = useState(0)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [goalForm, setGoalForm] = useState({ startWeight: '', targetWeight: '' })
  const [dateRange, setDateRange] = useState({
    preset: '7d',
    startDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: '7 Hari',
  })

  const logs = store.weightLogs
  // Filter logs by date range
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => l.date >= dateRange.startDate && l.date <= dateRange.endDate)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [logs, dateRange])

  const currentWeight = filteredLogs[0]?.weight || logs[0]?.weight || 0
  const prevWeight = logs[1]?.weight || currentWeight

  // Initialize bmiWeight from currentWeight once available
  useMemo(() => {
    if (currentWeight && !bmiWeight) setBmiWeight(currentWeight)
  }, [currentWeight])

  // BMI calculation
  const bmi = useMemo(() => {
    if (!bmiHeight || !bmiWeight) return 0
    const hMeters = bmiHeight / 100
    return bmiWeight / (hMeters * hMeters)
  }, [bmiHeight, bmiWeight])

  const bmiLabel = useMemo(() => {
    if (bmi === 0) return { text: '-', color: '' }
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-red-500' }
    if (bmi < 25) return { text: 'Ideal', color: 'text-green-500' }
    return { text: 'Overweight', color: 'text-red-500' }
  }, [bmi])
  const weekDiff = (currentWeight - (logs[6]?.weight || currentWeight)).toFixed(1)
  const goalWeight = store.user.weightGoal || 65
  const startWeight = store.user.weightStart || (logs[logs.length - 1]?.weight ?? currentWeight)
  const totalRange = Math.abs(startWeight - goalWeight)
  const progressMade = startWeight > goalWeight
    ? startWeight - currentWeight   // losing weight
    : currentWeight - startWeight   // gaining weight
  const progressPct = totalRange > 0
    ? Math.min(100, Math.max(0, Math.round((progressMade / totalRange) * 100)))
    : 0

  const openGoalModal = () => {
    setGoalForm({ startWeight: startWeight.toString(), targetWeight: goalWeight.toString() })
    setGoalModalOpen(true)
  }

  const saveGoal = () => {
    const sw = Number(goalForm.startWeight)
    const tw = Number(goalForm.targetWeight)
    if (!sw || !tw) return
    store.updateUser({ weightStart: sw, weightGoal: tw })
    setGoalModalOpen(false)
  }

  const resetProgress = () => {
    // Start tracking from latest weight
    const latest = currentWeight || 0
    store.updateUser({ weightStart: latest })
    setGoalForm((f) => ({ ...f, startWeight: latest.toString() }))
  }

  // Chart data - based on date range
  const chartData = useMemo(() => {
    const start = new Date(dateRange.startDate)
    const end = new Date(dateRange.endDate)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const data = []
    const totalDays = Math.round((end - start) / 86400000) + 1

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const log = logs.find((l) => l.date === dateStr)
      // Find previous day's log for diff
      const prevDate = new Date(d)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateStr = prevDate.toISOString().split('T')[0]
      const prevLog = logs.find((l) => l.date === prevDateStr)
      const diff = log && prevLog ? (log.weight - prevLog.weight).toFixed(1) : '0.0'
      const lbl = totalDays > 14
        ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : dayNames[d.getDay()]
      data.push({
        day: lbl,
        weight: log?.weight || null,
        diff: log && prevLog ? parseFloat(diff) : 0,
        label: log ? `${log.weight}` : '',
      })
    }
    return data
  }, [logs, dateRange])

  const openAdd = () => {
    setEditId(null)
    setForm({ date: new Date().toISOString().split('T')[0], weight: '', note: '' })
    setModalOpen(true)
  }

  const openEdit = (log) => {
    setEditId(log.id)
    setForm({ date: log.date, weight: log.weight.toString(), note: log.note })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.weight) return
    const data = { date: form.date, weight: Number(form.weight), note: form.note }
    if (editId) {
      store.updateWeightLog(editId, data)
    } else {
      store.addWeightLog(data)
    }
    setModalOpen(false)
  }

  const formatDateLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (dateStr === today) return 'Today'
    if (dateStr === yesterday) return 'Yesterday'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  }

  const getWeightChange = (idx) => {
    if (idx >= filteredLogs.length - 1) return null
    const diff = (filteredLogs[idx].weight - filteredLogs[idx + 1].weight).toFixed(1)
    return parseFloat(diff)
  }

  return (
    <Layout>
      {/* Weight Progress Chart */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#191c1d] dark:text-white">Weight Progress</h3>
          <DateFilter defaultPreset="7d" onChange={setDateRange} />
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6d797e' }} />
              <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <Tooltip
                contentStyle={{ background: '#1c1b1b', border: 'none', borderRadius: '8px', color: '#e5e2e1', fontSize: '12px' }}
                formatter={(val, name) => [name === 'weight' ? `${val} kg` : `${val} kg`, name === 'weight' ? 'Weight' : 'Change']}
              />
              <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.day === chartData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]?.day ? '#00677d' : '#00add0'} />
                ))}
                <LabelList
                  dataKey="label"
                  position="top"
                  style={{ fontSize: '9px', fontWeight: '600' }}
                  fill="#6d797e"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card">
          <p className="text-xs font-semibold text-[#6d797e] dark:text-[#869398] mb-1">Current Weight</p>
          <p className="text-2xl font-extrabold text-[#191c1d] dark:text-white">{currentWeight} kg</p>
          <div className="flex items-center gap-1 mt-1">
            {Number(weekDiff) <= 0 ? (
              <TrendingDown className="w-3.5 h-3.5 text-secondary dark:text-[#44e2cd]" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-tertiary dark:text-[#ffb86c]" />
            )}
            <span className={`text-xs font-semibold ${Number(weekDiff) <= 0 ? 'text-secondary dark:text-[#44e2cd]' : 'text-tertiary dark:text-[#ffb86c]'}`}>
              ~{weekDiff > 0 ? '+' : ''}{weekDiff} kg this week
            </span>
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-[#6d797e] dark:text-[#869398] mb-1">Body Metrics</p>
          <div className="flex gap-2">
            {/* Left: Height + Weight inputs */}
            <div className="flex-1 space-y-2">
              <div className="bg-surface-low dark:bg-[#201f1f] rounded-lg px-2 py-1.5">
                <p className="text-[10px] text-[#6d797e] dark:text-[#869398]">Height</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-[#191c1d] dark:text-white outline-none focus:ring-1 focus:ring-[#00add0] rounded px-0.5"
                  />
                  <span className="text-[10px] text-[#6d797e] dark:text-[#869398] whitespace-nowrap">cm</span>
                </div>
              </div>
              <div className="bg-surface-low dark:bg-[#201f1f] rounded-lg px-2 py-1.5">
                <p className="text-[10px] text-[#6d797e] dark:text-[#869398]">Weight</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-[#191c1d] dark:text-white outline-none focus:ring-1 focus:ring-[#00add0] rounded px-0.5"
                  />
                  <span className="text-[10px] text-[#6d797e] dark:text-[#869398] whitespace-nowrap">kg</span>
                </div>
              </div>
            </div>
            {/* Right: BMI output */}
            <div className="flex-1">
              <div className="bg-surface-low dark:bg-[#201f1f] rounded-lg px-2 py-1.5 h-full flex flex-col justify-center">
                <p className="text-[10px] text-[#6d797e] dark:text-[#869398]">Body Mass Index</p>
                <p className="text-lg font-extrabold text-[#191c1d] dark:text-white">{bmi > 0 ? bmi.toFixed(1) : '-'}</p>
                {bmi > 0 && (
                  <span className={`text-xs font-bold ${bmiLabel.color}`}>{bmiLabel.text}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress to Goal (clickable) */}
      <button onClick={openGoalModal} className="card mb-4 w-full text-left cursor-pointer hover:ring-1 hover:ring-[#00add0] transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-container dark:text-[#00add0]" />
            <h3 className="text-sm font-bold text-[#191c1d] dark:text-white">Progress to Goal</h3>
          </div>
          <span className="text-sm font-bold text-primary-container dark:text-[#00add0]">{goalWeight} kg</span>
        </div>
        <div className="h-3 bg-surface-high dark:bg-[#2a2a2a] rounded-full overflow-hidden mb-2">
          <div className="h-full bg-secondary dark:bg-[#44e2cd] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#6d797e] dark:text-[#869398]">Start: {startWeight} kg</span>
          <span className="text-[10px] font-semibold text-secondary dark:text-[#44e2cd]">{progressPct}% of target reached</span>
        </div>
      </button>

      {/* History */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#191c1d] dark:text-white">History</h3>
          <button className="text-xs font-semibold text-primary-container dark:text-[#00add0]">See All</button>
        </div>
        <div className="space-y-3">
          {filteredLogs.map((log, idx) => {
            const change = getWeightChange(idx)
            return (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-surface-high dark:border-[#27272a] last:border-0">
                <div className="w-10 h-10 rounded-xl bg-surface-low dark:bg-[#201f1f] flex items-center justify-center flex-shrink-0">
                  {idx === 0 ? (
                    <div className="w-3 h-3 rounded-sm bg-secondary dark:bg-[#44e2cd]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[#6d797e] dark:text-[#869398]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#191c1d] dark:text-white">{log.weight} kg</p>
                    {change !== null && (
                      <span className={`text-xs font-semibold ${change <= 0 ? 'text-secondary dark:text-[#44e2cd]' : 'text-tertiary dark:text-[#ffb86c]'}`}>
                        {change > 0 ? '+' : ''}{change} kg
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6d797e] dark:text-[#869398]">{log.note}</p>
                  <p className="text-[10px] text-[#6d797e] dark:text-[#869398]">{formatDateLabel(log.date)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(log)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-high dark:hover:bg-[#2a2a2a]">
                    <Pencil className="w-4 h-4 text-[#6d797e] dark:text-[#869398]" />
                  </button>
                  <button onClick={() => store.deleteWeightLog(log.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAB */}
      <button onClick={openAdd} className="fab">
        <Plus className="w-6 h-6" />
      </button>

      {/* Add/Edit Weight Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Weight' : 'Add Weight'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Weight (kg)</label>
            <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" placeholder="68.5" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Note</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input-field" placeholder="e.g., Makan malam karbo" />
          </div>
          <button onClick={handleSave} className="w-full py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold">
            {editId ? 'Update' : 'Save'}
          </button>
        </div>
      </Modal>

      {/* Goal Settings Modal */}
      <Modal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} title="Goal Settings">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Start Weight (kg)</label>
            <input type="number" step="0.1" value={goalForm.startWeight} onChange={(e) => setGoalForm({ ...goalForm, startWeight: e.target.value })} className="input-field" placeholder="74" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Target Weight (kg)</label>
            <input type="number" step="0.1" value={goalForm.targetWeight} onChange={(e) => setGoalForm({ ...goalForm, targetWeight: e.target.value })} className="input-field" placeholder="65" />
          </div>
          <button onClick={resetProgress} className="w-full py-3 rounded-full border-2 border-red-400 text-red-500 dark:border-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Reset Progress
          </button>
          <button onClick={saveGoal} className="w-full py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold">
            Save
          </button>
        </div>
      </Modal>
    </Layout>
  )
}
