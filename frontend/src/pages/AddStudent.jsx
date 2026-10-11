import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import StudentForm from '../components/StudentForm.jsx'

export default function AddStudent() {
  const navigate = useNavigate()

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Add student</h1>
          <p className="muted">The machine learning model predicts the performance level when you save.</p>
        </div>
      </header>
      <StudentForm
        submitLabel="Save student"
        onSubmit={async (payload) => {
          await api.addStudent(payload)
          navigate('/students')
        }}
        onCancel={() => navigate('/students')}
      />
    </>
  )
}
