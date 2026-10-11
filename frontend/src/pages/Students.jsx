import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import CategoryBadge from '../components/CategoryBadge.jsx'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      setStudents(await api.getStudents())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) =>
      [s.name, s.rollNumber, s.department].some((v) => v.toLowerCase().includes(q)))
  }, [students, query])

  const handleDelete = async (id) => {
    setError('')
    try {
      await api.deleteStudent(id)
      setStudents((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirmId(null)
    }
  }

  const handleRefresh = async () => {
    setError('')
    setNotice('')
    setRefreshing(true)
    try {
      const r = await api.recalculate()
      setNotice(r.predictedByMl === r.total
        ? `Predictions refreshed for ${r.total} students using the ML model.`
        : `Refreshed ${r.total} students, but only ${r.predictedByMl} used the ML model. Check that the ML service is running.`)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Students</h1>
          <p className="muted">{students.length} on record</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh predictions'}
          </button>
          <Link className="btn btn-primary" to="/students/new">Add student</Link>
        </div>
      </header>

      <input className="search" type="search" placeholder="Search by name, roll number or department"
             aria-label="Search students" value={query} onChange={(e) => setQuery(e.target.value)} />

      {error && <div className="alert" role="alert">{error}</div>}
      {notice && <div className="notice" role="status">{notice}</div>}

      {loading ? (
        <p className="muted">Loading students...</p>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p>{students.length === 0 ? 'No students yet.' : 'No students match your search.'}</p>
          {students.length === 0 && <Link className="btn btn-primary" to="/students/new">Add the first student</Link>}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Roll no.</th><th>Department</th>
                <th className="num">Attendance</th><th className="num">Study hrs/day</th>
                <th className="num">Predicted score</th><th>Performance</th><th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="strong"><Link className="row-link" to={`/students/${s.id}`}>{s.name}</Link></td>
                  <td>{s.rollNumber}</td>
                  <td>{s.department}</td>
                  <td className="num">{s.attendance}%</td>
                  <td className="num">{s.studyHours}</td>
                  <td className="num strong">{s.predictedScore}</td>
                  <td><CategoryBadge category={s.performanceCategory} /></td>
                  <td className="actions">
                    {confirmId === s.id ? (
                      <span className="confirm">
                        Delete {s.name}?
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Keep</button>
                      </span>
                    ) : (
                      <span className="row-actions">
                        <Link className="btn btn-ghost btn-sm" to={`/students/${s.id}`}>View</Link>
                        <Link className="btn btn-ghost btn-sm" to={`/students/${s.id}/edit`}>Edit</Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(s.id)}
                                aria-label={`Delete ${s.name}`}>Delete</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
