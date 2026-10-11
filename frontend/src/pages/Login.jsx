import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

const BANDS = [
  { label: 'High', width: '78%', cls: 'high' },
  { label: 'Average', width: '52%', cls: 'average' },
  { label: 'Low', width: '24%', cls: 'low' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <section className="login-art" aria-hidden="true">
        <h1>See who needs support before the exam does.</h1>
        <div className="bands">
          {BANDS.map((b) => (
            <div className="band-row" key={b.label}>
              <span>{b.label}</span>
              <div className="band-track">
                <div className={`band-fill band-${b.cls}`} style={{ width: b.width }} />
              </div>
            </div>
          ))}
        </div>
        <p>Predicted performance from attendance, study hours, marks and assignments.</p>
      </section>

      <section className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Log in</h2>
          <p className="muted">Use your faculty account to view and manage students.</p>

          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)}
                 autoComplete="username" autoFocus required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password}
                 onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />

          {error && <div className="alert" role="alert">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Logging in...' : 'Log in'}
          </button>
          <p className="hint">First time here? Use <strong>admin</strong> / <strong>admin123</strong>.</p>
        </form>
      </section>
    </div>
  )
}
