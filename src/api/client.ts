import { getToken, setToken, getRefreshToken, setRefreshToken } from './token'

export { setToken, setRefreshToken } from './token'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

let isRefreshing = false

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setToken(data.token)
    setRefreshToken(data.refreshToken)
    return true
  } catch {
    return false
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options })

  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true
    const refreshed = await tryRefresh()
    isRefreshing = false

    if (refreshed) {
      const newToken = getToken()
      if (newToken) headers['Authorization'] = `Bearer ${newToken}`
      const retry = await fetch(`${BASE_URL}${path}`, { headers, ...options })
      if (retry.ok) {
        if (retry.status === 204) return undefined as T
        return retry.json() as Promise<T>
      }
      const retryBody = await retry.json().catch(() => null)
      throw new Error(retryBody?.message ?? `Request failed: ${retry.status}`)
    }

    setToken(null)
    setRefreshToken(null)
    window.dispatchEvent(new Event('auth:session-expired'))
    throw new Error('Сесія закінчилась. Будь ласка, увійдіть знову.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed: ${res.status} ${res.statusText}`)
  }

  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
