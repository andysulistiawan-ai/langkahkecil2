import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, Circle, CheckCircle2 } from 'lucide-react'

const baseCategories = ['Kantor', 'Kesehatan', 'Keuangan', 'Soft Skill']

export default function Tasks() {
  const store = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ description: '', category: 'Kantor' })
  const [showCustomCat, setShowCustomCat] = useState(false)
  const [customCat, setCustomCat] = useState('')
  const [extraCategories, setExtraCategories] = useState([])

  const allCategories = [...baseCategories, ...extraCategories]

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = useMemo(() => store.tasks.filter((t) => t.date === today), [store.tasks, today])
  const completedCount = todayTasks.filter((t) => t.is_completed).length
  const totalCount = todayTasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (progress / 100) * circumference

  const openAdd = () => {
    setEditId(null)
    setForm({ description: '', category: 'Kantor' })
    setShowCustomCat(false)
    setCustomCat('')
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setEditId(task.id)
    setForm({ description: task.description, category: task.category })
    setShowCustomCat(false)
    setCustomCat('')
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.description.trim()) return
    if (editId) {
      store.updateTask(editId, form)
    } else {
      store.addTask({ ...form, date: today })
    }
    setModalOpen(false)
  }

  const addCustomCategory = () => {
    if (!customCat.trim()) return
    if (!baseCategories.includes(customCat.trim()) && !extraCategories.includes(customCat.trim())) {
      setExtraCategories([...extraCategories, customCat.trim()])
    }
    setForm({ ...form, category: customCat.trim() })
    setShowCustomCat(false)
    setCustomCat('')
  }

  const getCategoryColor = (cat) => {
    const colors = {
      'Kantor': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Kesehatan': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Keuangan': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Soft Skill': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    }
    return colors[cat] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }

  return (
    <Layout>
      {/* Circular Progress */}
      <div className="card flex flex-col items-center py-8 mb-4">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
              className="text-surface-high dark:text-[#2a2a2a]" />
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="text-secondary dark:text-[#44e2cd] transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-[#191c1d] dark:text-white">{progress}%</span>
          </div>
        </div>
        <h2 className="text-base font-bold text-[#191c1d] dark:text-white">
          {progress === 100 ? 'All Done! Great Job!' : progress >= 50 ? 'Keep Going!' : 'Teruslah Melangkah!'}
        </h2>
        <p className="text-xs text-[#6d797e] dark:text-[#869398] mt-1">{completedCount}/{totalCount} tasks completed today</p>
      </div>

      {/* Task List */}
      <div className="space-y-3 pb-8">
        {todayTasks.map((task) => (
          <div key={task.id} className="card flex items-center gap-3 py-3">
            <button onClick={() => store.toggleTask(task.id)} className="flex-shrink-0">
              {task.is_completed ? (
                <CheckCircle2 className="w-6 h-6 text-secondary dark:text-[#44e2cd]" />
              ) : (
                <Circle className="w-6 h-6 text-[#bcc8ce] dark:text-[#3d494d]" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold transition-all ${
                task.is_completed
                  ? 'line-through text-[#6d797e] dark:text-[#869398]'
                  : 'text-[#191c1d] dark:text-white'
              }`}>
                {task.description}
              </p>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${getCategoryColor(task.category)}`}>
                {task.category}
              </span>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openEdit(task)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-high dark:hover:bg-[#2a2a2a]">
                <Pencil className="w-4 h-4 text-[#6d797e] dark:text-[#869398]" />
              </button>
              <button onClick={() => store.deleteTask(task.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {todayTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#6d797e] dark:text-[#869398]">No tasks for today yet.</p>
            <p className="text-xs text-[#6d797e] dark:text-[#869398] mt-1">Tap + to add your first task!</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={openAdd} className="fab">
        <Plus className="w-6 h-6" />
      </button>

      {/* Add/Edit Task Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setShowCustomCat(false) }} title={editId ? 'Edit Task' : 'Add New Task'}>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    form.category === cat
                      ? 'bg-primary-container dark:bg-[#00add0] text-white'
                      : 'bg-surface-high dark:bg-[#2a2a2a] text-[#3d494d] dark:text-[#bcc8ce]'
                  }`}>
                  {cat}
                </button>
              ))}
              {!showCustomCat && (
                <button onClick={() => setShowCustomCat(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-surface-high dark:bg-[#2a2a2a] text-[#6d797e] dark:text-[#869398] border border-dashed border-[#6d797e] dark:border-[#869398]">
                  + Custom
                </button>
              )}
            </div>
            {showCustomCat && (
              <div className="flex gap-2 mt-2">
                <input
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomCategory()}
                  className="input-field flex-1"
                  placeholder="Type category name..."
                  autoFocus
                />
                <button onClick={addCustomCategory} className="px-4 rounded-lg bg-primary-container dark:bg-[#00add0] text-white font-semibold text-sm">Add</button>
                <button onClick={() => { setShowCustomCat(false); setCustomCat('') }} className="px-3 rounded-lg bg-surface-high dark:bg-[#2a2a2a] text-[#6d797e] dark:text-[#869398] text-sm">Cancel</button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#3d494d] dark:text-[#bcc8ce] uppercase tracking-wider mb-1.5">
              What do you want to do?
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Write task description here..."
            />
          </div>
          <button onClick={handleSave} className="w-full py-3 rounded-full bg-primary-container dark:bg-[#00add0] text-white font-bold">
            {editId ? 'Update' : 'Save'}
          </button>
        </div>
      </Modal>
    </Layout>
  )
}
