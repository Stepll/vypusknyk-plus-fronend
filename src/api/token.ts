export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('token', token)
  } else {
    localStorage.removeItem('token')
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken')
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem('refreshToken', token)
  } else {
    localStorage.removeItem('refreshToken')
  }
}
