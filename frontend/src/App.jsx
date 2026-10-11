import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Students from './pages/Students.jsx'
import AddStudent from './pages/AddStudent.jsx'
import EditStudent from './pages/EditStudent.jsx'
import StudentDetail from './pages/StudentDetail.jsx'

function Protected({ children }) {
  const { username } = useAuth()
  return username ? <Layout>{children}</Layout> : <Navigate to="/login" replace />
}

export default function App() {
  const { username } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={username ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/students" element={<Protected><Students /></Protected>} />
      <Route path="/students/new" element={<Protected><AddStudent /></Protected>} />
      <Route path="/students/:id" element={<Protected><StudentDetail /></Protected>} />
      <Route path="/students/:id/edit" element={<Protected><EditStudent /></Protected>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
