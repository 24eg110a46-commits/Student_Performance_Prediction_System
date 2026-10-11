import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Layout({ children }) {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>Student Performance</span>
        </div>
        <nav aria-label="Main">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/students" end>Students</NavLink>
          <NavLink to="/students/new">Add student</NavLink>
        </nav>
        <div className="sidebar-foot">
          <span className="who">Signed in as {username}</span>
          <button className="btn btn-ghost-light" onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}
