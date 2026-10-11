import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from 'recharts'
import { api } from '../api.js'
import CategoryBadge from '../components/CategoryBadge.jsx'

const COLORS = { HIGH: '#1F9D6B', AVERAGE: '#D9971A', LOW: '#D64550' }
const LABELS = { HIGH: 'High', AVERAGE: 'Average', LOW: 'Low' }

function StudentList({ title, students, emptyText }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {students.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <ul className="rank-list">
          {students.map((s) => (
            <li key={s.id}>
              <div>
                <Link className="row-link strong" to={`/students/${s.id}`}>{s.name}</Link>
                <span className="muted small">{s.rollNumber} &middot; {s.department}</span>
              </div>
              <div className="rank-right">
                <span className="strong">{s.predictedScore}</span>
                <CategoryBadge category={s.performanceCategory} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ScatterCard({ title, xKey, xLabel, xDomain, points }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey={xKey} name={xLabel} domain={xDomain}
                   label={{ value: xLabel, position: 'insideBottom', offset: -12 }} />
            <YAxis type="number" dataKey="score" name="Predicted score" domain={[0, 100]} />
            <ZAxis range={[60, 60]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend verticalAlign="top" height={28} />
            {Object.keys(COLORS).map((key) => (
              <Scatter key={key} name={LABELS[key]} fill={COLORS[key]}
                       data={points.filter((p) => p.category === key)} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [ml, setMl] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getDashboard().then(setData).catch((err) => setError(err.message))
    api.getMlStatus().then(setMl).catch(() => setMl({ available: false }))
  }, [])

  if (error) return <div className="alert" role="alert">{error}</div>
  if (!data) return <p className="muted">Loading dashboard...</p>

  if (data.totalStudents === 0) {
    return (
      <div className="empty">
        <h1>Dashboard</h1>
        <p>Add students to see how your class is performing.</p>
        <Link className="btn btn-primary" to="/students/new">Add the first student</Link>
      </div>
    )
  }

  const pieData = Object.entries(data.categoryCounts).map(([key, value]) => ({
    key, name: LABELS[key], value,
  }))

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">How your students are expected to perform</p>
        </div>
        {ml && (
          <div className={`engine ${ml.available ? 'engine-on' : 'engine-off'}`} role="status">
            {ml.available
              ? <>Prediction engine: {ml.modelType}<br /><span>Test accuracy {Math.round(ml.accuracy * 100)}%, trained on {ml.trainingSamples} records</span></>
              : <>ML service not reachable<br /><span>Using the rule-based fallback. Start ml-service to use the model.</span></>}
          </div>
        )}
      </header>

      <div className="stats">
        <div className="stat stat-main">
          <span className="stat-value">{data.averageScore}</span>
          <span className="stat-label">Average predicted score</span>
        </div>
        <div className="stat">
          <span className="stat-value">{data.totalStudents}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="stat">
          <span className="stat-value">{data.averageAttendance}%</span>
          <span className="stat-label">Average attendance</span>
        </div>
        <div className="stat">
          <span className="stat-value low-text">{data.categoryCounts.LOW}</span>
          <span className="stat-label">Need extra support</span>
        </div>
      </div>

      <div className="grid-2">
        <section className="card">
          <h2>Performance levels</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((d) => <Cell key={d.key} fill={COLORS[d.key]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h2>Predicted score spread</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Students" fill="#2457F5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <ScatterCard title="Attendance and predicted score" xKey="attendance" xLabel="Attendance (%)"
                     xDomain={[0, 100]} points={data.scorePoints} />
        <ScatterCard title="Study hours and predicted score" xKey="studyHours" xLabel="Study hours per day"
                     xDomain={[0, 'auto']} points={data.scorePoints} />
      </div>

      <section className="card">
        <h2>Average predicted score by department</h2>
        <div className="chart chart-short">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.departmentStats} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="department" width={130} />
              <Tooltip />
              <Bar dataKey="averageScore" name="Average score" fill="#12263A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid-2">
        <StudentList title="Top performers" students={data.topPerformers} emptyText="No students yet." />
        <StudentList title="Students who may need support" students={data.needsSupport}
                     emptyText="No students are in the low performance level right now." />
      </div>
    </>
  )
}
