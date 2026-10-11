const TOKEN_KEY = 'spps_token'
const USER_KEY = 'spps_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getUser = () => localStorage.getItem(USER_KEY)

export function saveSession(token, username) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, username)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401 && path !== '/auth/login') {
    clearSession()
    window.location.href = '/login'
    throw new Error('Your session has ended. Please log in again.')
  }

  if (!res.ok) {
    let message = 'Something went wrong. Please try again.'
    try {
      const body = await res.json()
      if (body.message) message = body.message
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message)
  }

  return res.status === 204 ? null : res.json()
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getStudents: () => request('/students'),
  getStudent: (id) => request(`/students/${id}`),
  addStudent: (student) => request('/students', { method: 'POST', body: JSON.stringify(student) }),
  updateStudent: (id, student) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),
  recalculate: () => request('/students/recalculate', { method: 'POST' }),
  predict: (factors) => request('/predict', { method: 'POST', body: JSON.stringify(factors) }),
  getMlStatus: () => request('/ml/status'),
  getDashboard: () => request('/dashboard/summary'),
}
