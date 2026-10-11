import { createContext, useContext, useState } from 'react'
import { api, clearSession, getToken, getUser, saveSession } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(getToken() ? getUser() : null)

  const login = async (user, password) => {
    const data = await api.login(user, password)
    saveSession(data.token, data.username)
    setUsername(data.username)
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      /* ignore: we clear the local session either way */
    }
    clearSession()
    setUsername(null)
  }

  return <AuthContext.Provider value={{ username, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
