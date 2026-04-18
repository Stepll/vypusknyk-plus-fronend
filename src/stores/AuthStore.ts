import { makeAutoObservable, runInAction } from 'mobx'
import { api, setToken, setRefreshToken } from '../api/client'
import { RibbonState } from '../constants/ribbonRules'
import {
  fetchDesigns,
  createDesign,
  updateDesign,
  deleteDesign,
} from '../api/designs'
import { DesignResponse } from '../api/types'

interface AuthResponseDto {
  id: string
  email: string
  fullName: string
  phone: string | null
  token: string
  refreshToken: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  fullName: string
  phone: string
}

export interface SavedDesign {
  id: string
  designName: string
  savedAt: string
  state: RibbonState
}

class AuthStore {
  user: AuthUser | null = null
  loading = false
  error: string | null = null
  savedDesigns: SavedDesign[] = []
  pendingDesign: SavedDesign | null = null

  constructor() {
    makeAutoObservable(this)
    this.restoreSession()
    window.addEventListener('auth:session-expired', () => {
      runInAction(() => {
        this.user = null
        this.savedDesigns = []
        this.pendingDesign = null
        this.error = null
      })
    })
  }

  get isLoggedIn(): boolean {
    return this.user !== null
  }

  private restoreSession(): void {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      try {
        this.user = JSON.parse(userData)
        this.loadDesigns()
      } catch {
        this.logout()
      }
    }
  }

  private saveSession(user: AuthUser, dto: AuthResponseDto): void {
    setToken(dto.token)
    setRefreshToken(dto.refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
  }

  private toAuthUser(dto: AuthResponseDto): AuthUser {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.fullName || dto.email.split('@')[0],
      fullName: dto.fullName,
      phone: dto.phone ?? '',
    }
  }

  private fromDto(dto: DesignResponse): SavedDesign {
    return {
      id: dto.id,
      designName: dto.designName,
      savedAt: new Date(dto.savedAt).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      state: dto.state as RibbonState,
    }
  }

  async loadDesigns(): Promise<void> {
    try {
      const designs = await fetchDesigns()
      runInAction(() => {
        this.savedDesigns = designs.map(d => this.fromDto(d))
      })
    } catch { /* ignore */ }
  }

  async login(email: string, password: string): Promise<void> {
    this.loading = true
    this.error = null
    try {
      const dto = await api.post<AuthResponseDto>('/api/v1/auth/login', { email, password })
      const user = this.toAuthUser(dto)
      runInAction(() => {
        this.user = user
        this.loading = false
      })
      this.saveSession(user, dto)
      this.loadDesigns()
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Помилка входу'
        this.loading = false
      })
      throw e
    }
  }

  async register(email: string, password: string): Promise<void> {
    this.loading = true
    this.error = null
    try {
      const dto = await api.post<AuthResponseDto>('/api/v1/auth/register', {
        email,
        password,
        fullName: '',
        phone: null,
      })
      const user = this.toAuthUser(dto)
      runInAction(() => {
        this.user = user
        this.loading = false
      })
      this.saveSession(user, dto)
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Помилка реєстрації'
        this.loading = false
      })
      throw e
    }
  }

  async updateProfile(fullName: string, phone: string): Promise<void> {
    if (!this.user) return
    this.loading = true
    try {
      const dto = await api.put<AuthResponseDto>('/api/v1/auth/profile', { fullName, phone })
      const user = this.toAuthUser(dto)
      runInAction(() => {
        this.user = user
        this.loading = false
      })
      this.saveSession(user, dto)
    } catch (e) {
      runInAction(() => {
        this.loading = false
      })
      throw e
    }
  }

  async updatePassword(newPassword: string, currentPassword: string = ''): Promise<void> {
    this.loading = true
    try {
      await api.put('/api/v1/auth/password', { currentPassword, newPassword })
      runInAction(() => {
        this.loading = false
      })
    } catch (e) {
      runInAction(() => {
        this.loading = false
      })
      throw e
    }
  }

  saveDesign(designName: string, state: RibbonState): void {
    const existingIdx = this.savedDesigns.findIndex(d => d.designName === designName)
    if (existingIdx >= 0) {
      const existing = this.savedDesigns[existingIdx]
      this.savedDesigns[existingIdx] = { ...existing, state }
      updateDesign(existing.id, designName, state)
        .then(dto => {
          runInAction(() => {
            const idx = this.savedDesigns.findIndex(d => d.id === dto.id)
            if (idx >= 0) this.savedDesigns[idx] = this.fromDto(dto)
          })
        })
        .catch(() => {})
    } else {
      const tempId = Math.random().toString(36).slice(2, 9)
      const design: SavedDesign = {
        id: tempId,
        designName,
        savedAt: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' }),
        state: { ...state },
      }
      this.savedDesigns.unshift(design)
      createDesign(designName, state)
        .then(dto => {
          runInAction(() => {
            const idx = this.savedDesigns.findIndex(d => d.id === tempId)
            if (idx >= 0) this.savedDesigns[idx] = this.fromDto(dto)
          })
        })
        .catch(() => {})
    }
  }

  removeDesign(id: string): void {
    this.savedDesigns = this.savedDesigns.filter(d => d.id !== id)
    deleteDesign(id).catch(() => {})
  }

  loadDesign(design: SavedDesign): void {
    this.pendingDesign = design
  }

  consumePendingDesign(): SavedDesign | null {
    const d = this.pendingDesign
    this.pendingDesign = null
    return d
  }

  logout(): void {
    this.user = null
    this.savedDesigns = []
    this.pendingDesign = null
    this.error = null
    setToken(null)
    setRefreshToken(null)
    localStorage.removeItem('user')
  }
}

export default AuthStore
