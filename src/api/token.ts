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
