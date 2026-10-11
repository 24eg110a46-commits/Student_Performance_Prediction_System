import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import StudentForm from '../components/StudentForm.jsx'

export default function EditStudent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getStudent(id).then(setStudent).catch((err) => setError(err.message))
  }, [id])

  if (error) return <div className="alert" role="alert">{error}</div>
  if (!student) return <p className="muted">Loading student...</p>

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Edit {student.name}</h1>
          <p className="muted">The prediction is recalculated when you save.</p>
        </div>
      </header>
      <StudentForm
        initial={student}
        submitLabel="Save changes"
        onSubmit={async (payload) => {
          await api.updateStudent(id, payload)
          navigate(`/students/${id}`)
        }}
        onCancel={() => navigate(`/students/${id}`)}
      />
    </>
  )
}
