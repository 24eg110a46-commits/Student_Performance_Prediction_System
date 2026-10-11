import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import CategoryBadge from '../components/CategoryBadge.jsx'

function Meter({ label, value, max = 100, unit = '' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="meter">
      <div className="meter-head"><span>{label}</span><strong>{value}{unit}</strong></div>
      <div className="meter-track"><div className="meter-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [s, setS] = useState(null)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    api.getStudent(id).then(setS).catch((err) => setError(err.message))
  }, [id])

  const handleDelete = async () => {
    try {
      await api.deleteStudent(id)
      navigate('/students')
    } catch (err) {
      setError(err.message)
      setConfirming(false)
    }
  }

  if (error) return <div className="alert" role="alert">{error}</div>
  if (!s) return <p className="muted">Loading student...</p>

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{s.name}</h1>
          <p className="muted">{s.rollNumber} &middot; {s.department}</p>
        </div>
        <div className="head-actions">
          <Link className="btn btn-ghost" to="/students">Back to students</Link>
          <Link className="btn btn-primary" to={`/students/${s.id}/edit`}>Edit</Link>
        </div>
      </header>

      <div className="grid-2">
        <section className="card">
          <h2>Predicted performance</h2>
          <div className="verdict">
            <CategoryBadge category={s.performanceCategory} />
            <span className="verdict-score">{s.predictedScore}</span>
            <span className="muted">expected score out of 100</span>
          </div>
          <p className="muted small">
            {s.confidence != null
              ? `Model confidence ${Math.round(s.confidence * 100)}%. Source: ${s.predictionSource}.`
              : `Source: ${s.predictionSource}. Start the ML service and use "Refresh predictions" on the students page for a model-based result.`}
          </p>
        </section>

        <section className="card">
          <h2>Factors</h2>
          <Meter label="Attendance" value={s.attendance} unit="%" />
          <Meter label="Study hours per day" value={s.studyHours} max={10} />
          <Meter label="Previous exam marks" value={s.previousMarks} />
          <Meter label="Assignment score" value={s.assignmentScore} />
          <Meter label="Internal marks" value={s.internalMarks} />
          <Meter label="Activities joined" value={s.activities} max={10} />
        </section>
      </div>

      <section className="card danger-zone">
        {confirming ? (
          <span className="confirm">
            Delete {s.name}? This cannot be undone.
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Keep</button>
          </span>
        ) : (
          <button className="btn btn-ghost" onClick={() => setConfirming(true)}>Delete this student</button>
        )}
      </section>
    </>
  )
}
