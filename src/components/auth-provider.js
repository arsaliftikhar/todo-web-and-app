"use client"

import axios from "axios"
import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = async () => {
    try {
      const res = await axios.get("/api/user/me")
      setUser(res.data.user)
    } catch (err) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/user/login", { email, password })
      setUser(res.data.user)
      return true
    } catch (error) {
      const msg = error?.response?.data?.message || "Login failed"
      throw new Error(msg)
    }
  }

  const register = async (email, password) => {
    try {
      const res = await axios.post("/api/user/register", {
        email,
        password
      })
      setUser(res.data.user)
      return true
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed"
      throw new Error(msg)
    }
  }

  const logout = async () => {
    await axios.post("/api/user/logout")
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        loadUser, // ✅ correctly exposed
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
