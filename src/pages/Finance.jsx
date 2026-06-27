import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, TrendingDown, TrendingUp, X, Eye, EyeOff, Filter, Check } from 'lucide-react'
import DateFilter from '../components/DateFilter'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

const expenseCategories = ['Makan Keluarga', 'Makan Kantor', 'Jajan Suami', 'Jajan Istri', 'Jajan Adik', 'Belanja Rumah', 'Hiburan', 'Kesehatan', 'Transport Suami', 'Transport Istri']
const incomeCategories = ['Gaji', 'Pindah Dompet']
const allCategories = ['Semua', ...expenseCategories, ...incomeCategories]

export default function Finance() {
  const store = useStore()
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [activeTab, setActiveTab] = useState('all') // all, income, expense
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [categories, setCategories] = useState(allCategories)
  const [extraExpenseCats, setExtraExpenseCats] = useState([])
  const [extraIncomeCats, setExtraIncomeCats] = useState([])
  const [showCustomCat, setShowCustomCat] = useState(false)
  const [customCat, setCustomCat] = useState('')
  const [hideBalance, setHideBalance] = useState(false)
  const [hideIncome, setHideIncome] = useState(false)
  const [hideExpense, setHideExpense] = useState(false)
  const [visibleCategories, setVisibleCategories] = useState(allCategories)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [filterDraft, setFilterDraft] = useState(allCategories)
  const [dateRange, setDateRange] = useState({
    preset: 'month',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: 'Bulan Ini',
  })

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category: 'Makan Keluarga',
    amount: '',
    note: '',
  })

  // Categories available based on selected type in modal
  const activeTypeCategories = useMemo(() => {
    return form.type === 'income'
      ? [...incomeCategories, ...extraIncomeCats]
      : [...expenseCategories, ...extraExpenseCats]
  }, [form.type, extraExpenseCats, extraIncomeCats])

  const totalIncome = useMemo(() => store.transactions.filter((t) => t.type === 'income' && t.date >= dateRange.startDate && t.date <= dateRange.endDate).reduce((a, t) => a + t.amount, 0), [store.transactions, dateRange])
  const totalExpense = useMemo(() => store.transactions.filter((t) => t.type === 'expense' && t.date >= dateRange.startDate && t.date <= dateRange.endDate).reduce((a, t) => a + t.amount, 0), [store.transactions, dateRange])
  const balance = totalIncome - totalExpense

  // Filter transactions by date range + category + tab
  const filtered = useMemo(() => {
    let txs = [...store.transactions]
    txs = txs.filter((t) => t.date >= dateRange.startDate && t.date <= dateRange.endDate)
    if (activeCategory !== 'Semua') txs = txs.filter((t) => t.category === activeCategory)
    if (activeTab === 'income') txs = txs.filter((t) => t.type === 'income')
    if (activeTab === 'expense') txs = txs.filter((t) => t.type === 'expense')
    return txs
  }, [store.transactions, activeCategory, activeTab, dateRange])

  // Group by date
  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach((t) => {
      if (!g[t.date]) g[t.date] = []
      g[t.date].push(t)
    })
    return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  // Chart data - based on date range
  const chartData = useMemo(() => {
    const start = new Date(dateRange.startDate)
    const end = new Date(dateRange.endDate)
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    const days = []
    const totalDays = Math.round((end - start) / 86400000) + 1
    // If range > 14 days, group by week; otherwise show daily
    const step = totalDays > 30 ? 7 : 1
    for (let i = 0; i < totalDays; i += step) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      // For weekly grouping, sum the range
      const endD = new Date(d)
      endD.setDate(endD.getDate() + step - 1)
      const dayTxs = store.transactions.filter((t) => {
        return t.date >= dateStr && t.date <= endD.toISOString().split('T')[0]
      })
      const income = dayTxs.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
      const expense = dayTxs.filter((t) => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
      const lbl = totalDays > 14
        ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : dayNames[d.getDay()]
      days.push({
        day: lbl,
        income: income / 1000,
        expense: expense / 1000,
        net: (income - expense) / 1000,
        incomeLabel: income > 0 ? `${(income / 1000).toFixed(0)}k` : '',
        expenseLabel: expense > 0 ? `${(expense / 1000).toFixed(0)}k` : '',
      })
    }
    return days
  }, [store.transactions, dateRange])

  const openAdd = () => {
    setEditId(null)
    setForm({ date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Makan Keluarga', amount: '', note: '' })
    setModalOpen(true)
  }

  const openEdit = (tx) => {
    setEditId(tx.id)
    setForm({ date: tx.date, type: tx.type, category: tx.category, amount: tx.amount.toString(), note: tx.note })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.amount) return
    const data = { ...form, amount: Number(form.amount) }
    if (editId) {
      store.updateTransaction(editId, data)
    } else {
      store.addTransaction(data)
    }
    setModalOpen(false)
    setShowCustomCat(false)
  }

  const addCustomCategory = () => {
    if (!customCat) return
    if (form.type === 'income') {
      if (!incomeCategories.includes(customCat) && !extraIncomeCats.includes(customCat)) {
        setExtraIncomeCats([...extraIncomeCats, customCat])
        setCategories([...categories, customCat])
      }
    } else {
      if (!expenseCategories.includes(customCat) && !extraExpenseCats.includes(customCat)) {
        setExtraExpenseCats([...extraExpenseCats, customCat])
        setCategories([...categories, customCat])
      }
    }
    setForm({ ...form, category: customCat })
    setShowCustomCat(false)
    setCustomCat('')
  }

  const formatDateLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (dateStr === today) return 'Hari Ini'
    if (dateStr === yesterday) return 'Kemarin'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })
  }

  const dayTotal = (txs) => txs.reduce((a, t) => t.type === 'income' ? a + t.amount : a - t.amount, 0)

  return (
    <Layout>
      {/* Balance Summary */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-[#6d797e] dark:text-[#869398] uppercase tracking-wider">Total Saldo</p>
          <button onClick={() => setHideBalance(!hideBalance)} className="text-[#6d797e] dark:text-[#869398] hover:text-[#3d494d] dark:hover:text-white transition-colors">
            {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <h2 className="text-3xl font-extrabold text-primary-container dark:text-[#53d6fa] mb-4">
          {hideBalance ? 'Rp •••••••' : formatRupiah(balance)}
        </h2>
        <div className="flex gap-4">
          <div className="flex-1 bg-green-50 dark:bg-green-900/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Pemasukan</span>
              </div>
              <button onClick={() => setHideIncome(!hideIncome)} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
                {hideIncome ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-sm font-bold text-green-700 dark:text-green-300">
              {hideIncome ? 'Rp •••••••' : formatRupiah(totalIncome)}
            </p>
          </div>
          <div className="flex-1 bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-red-500 dark:text-red-400" />
                <span className="text-xs font-semibold text-red-500 dark:text-red-400">Pengeluaran</span>
              </div>
              <button onClick={() => setHideExpense(!hideExpense)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
                {hideExpense ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-sm font-bold text-red-600 dark:text-red-300">
              {hideExpense ? 'Rp •••••••' : formatRupiah(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#191c1d] dark:text-white">Pengeluaran</h3>
          <DateFilter defaultPreset="month" onChange={setDateRange} />
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6d797e' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1c1b1b', border: 'none', borderRadius: '8px', color: '#e5e2e1', fontSize: '12px' }}
                formatter={(val) => [`${val}k`, '']}
              />
              <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="#44e2cd" />)}
                <LabelList dataKey="incomeLabel" position="top" style={{ fontSize: '9px', fontWeight: '600' }} fill="#16a34a" />
              </Bar>
              <Bar dataKey="expense" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="#00add0" />)}
                <LabelList dataKey="expenseLabel" position="top" style={{ fontSize: '9px', fontWeight: '600' }} fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-[#191c1d] dark:text-white">Kategori</h3>
          <button onClick={() => { setFilterDraft([...visibleCategories]); setFilterModalOpen(true) }}
            className="flex items-center gap-1 text-xs font-semibold text-primary-container dark:text-[#00add0]">
            <Filter className="w-3.5 h-3.5" />
            Custom Filter
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {visibleCategories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-container dark:bg-[#00add0] text-white'
                  : 'bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce]'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-surface-low dark:bg-[#1c1b1b] rounded-lg p-1">
        {[
          { key: 'all', label: 'Riwayat' },
          { key: 'income', label: 'Hanya Pemasukan' },
          { key: 'expense', label: 'Hanya Pengeluaran' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === key
                ? 'bg-white dark:bg-[#2a2a2a] text-[#191c1d] dark:text-white shadow-sm'
                : 'text-[#6d797e] dark:text-[#869398]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4 pb-8">
        {grouped.map(([date, txs]) => (
          <div key={date}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#3d494d] dark:text-[#bcc8ce]">{formatDateLabel(date)}</h4>
              <span className={`text-xs font-bold ${dayTotal(txs) >= 0 ? 'text-secondary dark:text-[#44e2cd]' : 'text-tertiary dark:text-[#ffb86c]'}`}>
                {dayTotal(txs) >= 0 ? '+' : ''}{formatRupiah(Math.abs(dayTotal(txs)))}
              </span>
            </div>
            <div className="space-y-2">
              {txs.map((tx) => (
                <div key={tx.id} className="card flex items-center gap-3 py-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'income' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
                  }`}>
                    {tx.type === 'income'
                      ? <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                      : <TrendingUp className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#191c1d] dark:text-white truncate">{tx.note}</p>
                    <p className="text-[10px] text-[#6d797e] dark:text-[#869398]">{tx.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                    </p>
                    <div className="flex gap-1 justify-end mt-1">
                      <button onClick={() => openEdit(tx)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-high dark:hover:bg-[#2a2a2a]">
                        <Pencil className="w-3 h-3 text-[#6d797e] dark:text-[#869398]" />
                      </button>
                      <button onClick={() => store.deleteTransaction(tx.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={openAdd} className="fab">
        <Plus className="w-6 h-6" />
      </button>

      {/* Add/Edit Transaction Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setShowCustomCat(false) }} title={editId ? 'Edit Transaction' : 'Add Transaction'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-2">Type</label>
            <div className="flex gap-2">
              <button onClick={() => setForm({ ...form, type: 'expense', category: expenseCategories[0] })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce]'}`}>
                Expense
              </button>
              <button onClick={() => setForm({ ...form, type: 'income', category: incomeCategories[0] })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${form.type === 'income' ? 'bg-green-500 text-white' : 'bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce]'}`}>
                Income
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Category</label>
            {!showCustomCat ? (
              <div className="flex flex-wrap gap-2">
                {activeTypeCategories.map((cat) => (
                  <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${form.category === cat ? 'bg-primary-container dark:bg-[#00add0] text-white' : 'bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce]'}`}>
                    {cat}
                  </button>
                ))}
                <button onClick={() => setShowCustomCat(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-high dark:bg-[#2a2a2a] text-[#6d797e] dark:text-[#869398] border border-dashed border-[#6d797e] dark:border-[#869398]">
                  + Custom
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={customCat} onChange={(e) => setCustomCat(e.target.value)} className="input-field flex-1" placeholder="Custom category..." />
                <button onClick={addCustomCategory} className="px-4 rounded-lg bg-primary-container dark:bg-[#00add0] text-white font-semibold text-sm">Add</button>
                <button onClick={() => setShowCustomCat(false)} className="px-3 rounded-lg bg-surface-high dark:bg-[#2a2a2a]"><X className="w-4 h-4 text-[#6d797e]" /></button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Amount</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">Notes</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input-field" placeholder="Description..." />
          </div>
          <button onClick={handleSave} className="w-full py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold">
            {editId ? 'Update' : 'Save'}
          </button>
        </div>
      </Modal>

      {/* Custom Filter Modal */}
      <Modal isOpen={filterModalOpen} onClose={() => setFilterModalOpen(false)} title="Custom Filter">
        <div className="space-y-4">
          <p className="text-xs text-[#6d797e] dark:text-[#869398]">Pilih kategori yang ingin ditampilkan sebagai filter:</p>
          <div className="flex gap-2">
            <button onClick={() => setFilterDraft([...categories])} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-container dark:bg-[#00add0] text-white">
              Pilih Semua
            </button>
            <button onClick={() => setFilterDraft(['Semua'])} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce]">
              Reset Default
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {categories.map((cat) => {
              const checked = filterDraft.includes(cat)
              return (
                <button key={cat}
                  onClick={() => {
                    if (checked) {
                      setFilterDraft(filterDraft.filter((c) => c !== cat))
                    } else {
                      setFilterDraft([...filterDraft, cat])
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-low dark:hover:bg-[#201f1f] transition-colors">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                    checked
                      ? 'bg-primary-container dark:bg-[#00add0] border-primary-container dark:border-[#00add0]'
                      : 'border-[#bcc8ce] dark:border-[#3d494d]'
                  }`}>
                    {checked && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm font-semibold text-[#191c1d] dark:text-white">{cat}</span>
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              setVisibleCategories(filterDraft.length > 0 ? filterDraft : ['Semua'])
              if (!filterDraft.includes(activeCategory)) setActiveCategory(filterDraft[0] || 'Semua')
              setFilterModalOpen(false)
            }} className="flex-1 py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold">
              Simpan
            </button>
            <button onClick={() => setFilterModalOpen(false)} className="flex-1 py-3 rounded-full bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce] font-bold">
              Batal
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
