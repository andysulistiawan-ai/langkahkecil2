import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Finance from './pages/Finance'
import Tasks from './pages/Tasks'
import Weight from './pages/Weight'

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/tasks" element={<Tasks />} />
      </Routes>
    </BrowserRouter>
  )
}
