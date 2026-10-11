import { useState } from 'react'
import { api } from '../api.js'
import CategoryBadge from './CategoryBadge.jsx'

export const EMPTY_STUDENT = {
  name: '', rollNumber: '', department: '',
  attendance: '', studyHours: '', previousMarks: '',
  assignmentScore: '', internalMarks: '', activities: '',
}

const NUMBER_FIELDS = [
  { key: 'attendance', label: 'Attendance (%)', min: 0, max: 100, step: 0.1 },
  { key: 'studyHours', label: 'Study hours per day', min: 0, max: 24, step: 0.5 },
  { key: 'previousMarks', label: 'Previous exam marks (out of 100)', min: 0, max: 100, step: 0.1 },
  { key: 'assignmentScore', label: 'Assignment score (out of 100)', min: 0, max: 100, step: 0.1 },
  { key: 'internalMarks', label: 'Internal marks (out of 100)', min: 0, max: 100, step: 0.1 },
  { key: 'activities', label: 'Academic activities joined (0 to 10)', min: 0, max: 10, step: 1 },
]

const toPayload = (f) => ({
  name: f.name,
  rollNumber: f.rollNumber,
  department: f.department,
  attendance: Number(f.attendance),
  studyHours: Number(f.studyHours),
  previousMarks: Number(f.previousMarks),
  assignmentScore: Number(f.assignmentScore),
  internalMarks: Number(f.internalMarks),
  activities: Number(f.activities),
})

/** Shared by the Add and Edit pages. onSubmit receives the payload and may throw an Error. */
export default function StudentForm({ initial = EMPTY_STUDENT, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)
  const [previewing, setPreviewing] = useState(false)

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value })
    setPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSubmit(toPayload(form))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const handlePreview = async () => {
    setError('')
    const missing = NUMBER_FIELDS.some((f) => form[f.key] === '')
    if (missing) {
      setError('Fill in all the number fields to check the prediction.')
      return
    }
    setPreviewing(true)
    try {
      const { name, rollNumber, department, ...factors } = toPayload(form)
      setPreview(await api.predict(factors))
    } catch (err) {
      setError(err.message)
    } finally {
      setPreviewing(false)
    }
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Full name</label>
        <input id="name" value={form.name} onChange={set('name')} required />
      </div>
      <div className="field">
        <label htmlFor="rollNumber">Roll number</label>
        <input id="rollNumber" value={form.rollNumber} onChange={set('rollNumber')} required />
      </div>
      <div className="field">
        <label htmlFor="department">Department</label>
        <input id="department" value={form.department} onChange={set('department')} required />
      </div>

      {NUMBER_FIELDS.map((f) => (
        <div className="field" key={f.key}>
          <label htmlFor={f.key}>{f.label}</label>
          <input id={f.key} type="number" min={f.min} max={f.max} step={f.step}
                 value={form[f.key]} onChange={set(f.key)} required />
        </div>
      ))}

      {preview && (
        <div className="preview span-all" role="status">
          <CategoryBadge category={preview.category} />
          <span>Predicted score <strong>{preview.score}</strong></span>
          {preview.confidence != null && <span>Model confidence <strong>{Math.round(preview.confidence * 100)}%</strong></span>}
          <span className="muted small">Source: {preview.source}</span>
        </div>
      )}

      {error && <div className="alert span-all" role="alert">{error}</div>}

      <div className="form-actions span-all">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Saving...' : submitLabel}
        </button>
        <button className="btn btn-ghost" type="button" onClick={handlePreview} disabled={previewing}>
          {previewing ? 'Checking...' : 'Check prediction'}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
