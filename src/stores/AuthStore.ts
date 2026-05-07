import { makeAutoObservable, runInAction } from 'mobx'
import { api, setToken, setRefreshToken } from '../api/client'
import { getGuestToken, claimGuestOrders } from '../api/guest'
import { RibbonState } from '../constants/ribbonRules'
import {
  fetchDesigns,
  createDesign,
  updateDesign,
  deleteDesign,
} from '../api/designs'
import {
  fetchBadgeDesigns,
  createBadgeDesign,
  updateBadgeDesign,
  deleteBadgeDesign,
} from '../api/badge-designs'
import {
  fetchCertificateDesigns,
  createCertificateDesign,
  updateCertificateDesign,
  deleteCertificateDesign,
} from '../api/certificate-designs'
import { DesignResponse, BadgeDesignResponse, CertificateDesignResponse } from '../api/types'
import type { BadgeState } from '../constants/badgeData'
import type { CertificateState } from '../constants/certificateData'

interface AuthResponseDto {
  id: number
  email: string
  isEmailVerified: boolean
  fullName: string
  phone: string | null
  token: string
  refreshToken: string
}

export interface AuthUser {
  id: number
  email: string
  isEmailVerified: boolean
  name: string
  fullName: string
  phone: string
}

export interface SavedDesign {
  id: number | string  // number = real DB id, string = optimistic temp id
  designName: string
  savedAt: string
  state: RibbonState
}

export interface SavedBadgeDesign {
  id: number | string
  designName: string
  savedAt: string
  state: BadgeState
}

export interface SavedCertificateDesign {
  id: number | string
  designName: string
  savedAt: string
  state: CertificateState
}

class AuthStore {
  user: AuthUser | null = null
  loading = false
  error: string | null = null
  savedDesigns: SavedDesign[] = []
  pendingDesign: SavedDesign | null = null
  savedBadgeDesigns: SavedBadgeDesign[] = []
  pendingBadgeDesign: SavedBadgeDesign | null = null
  savedCertificateDesigns: SavedCertificateDesign[] = []
  pendingCertificateDesign: SavedCertificateDesign | null = null

  constructor() {
    makeAutoObservable(this)
    this.restoreSession()
    window.addEventListener('auth:session-expired', () => {
      runInAction(() => {
        this.user = null
        this.savedDesigns = []
        this.pendingDesign = null
        this.savedBadgeDesigns = []
        this.pendingBadgeDesign = null
        this.savedCertificateDesigns = []
        this.pendingCertificateDesign = null
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
        this.loadBadgeDesigns()
        this.loadCertificateDesigns()
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
      isEmailVerified: dto.isEmailVerified ?? false,
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

  private fromBadgeDto(dto: BadgeDesignResponse): SavedBadgeDesign {
    return {
      id: dto.id,
      designName: dto.designName,
      savedAt: new Date(dto.savedAt).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      state: dto.state as BadgeState,
    }
  }

  private fromCertificateDto(dto: CertificateDesignResponse): SavedCertificateDesign {
    return {
      id: dto.id,
      designName: dto.designName,
      savedAt: new Date(dto.savedAt).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      state: dto.state as CertificateState,
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

  async loadBadgeDesigns(): Promise<void> {
    try {
      const designs = await fetchBadgeDesigns()
      runInAction(() => {
        this.savedBadgeDesigns = designs.map(d => this.fromBadgeDto(d))
      })
    } catch { /* ignore */ }
  }

  async loadCertificateDesigns(): Promise<void> {
    try {
      const designs = await fetchCertificateDesigns()
      runInAction(() => {
        this.savedCertificateDesigns = designs.map(d => this.fromCertificateDto(d))
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
      this.loadBadgeDesigns()
      this.loadCertificateDesigns()
      claimGuestOrders(getGuestToken()).catch(() => {})
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Помилка входу'
        this.loading = false
      })
      throw e
    }
  }

  async loginWithGoogle(accessToken: string): Promise<void> {
    this.loading = true
    this.error = null
    try {
      const dto = await api.post<AuthResponseDto>('/api/v1/auth/google', { accessToken })
      const user = this.toAuthUser(dto)
      runInAction(() => {
        this.user = user
        this.loading = false
      })
      this.saveSession(user, dto)
      this.loadDesigns()
      this.loadBadgeDesigns()
      this.loadCertificateDesigns()
      claimGuestOrders(getGuestToken()).catch(() => {})
    } catch (e) {
      runInAction(() => {
        this.error = e instanceof Error ? e.message : 'Помилка Google авторизації'
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
      claimGuestOrders(getGuestToken()).catch(() => {})
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

  removeDesign(id: number | string): void {
    this.savedDesigns = this.savedDesigns.filter(d => d.id !== id)
    if (typeof id === 'number') deleteDesign(id).catch(() => {})
  }

  loadDesign(design: SavedDesign): void {
    this.pendingDesign = design
  }

  consumePendingDesign(): SavedDesign | null {
    const d = this.pendingDesign
    this.pendingDesign = null
    return d
  }

  saveBadgeDesign(designName: string, state: BadgeState): void {
    const existingIdx = this.savedBadgeDesigns.findIndex(d => d.designName === designName)
    if (existingIdx >= 0) {
      const existing = this.savedBadgeDesigns[existingIdx]
      this.savedBadgeDesigns[existingIdx] = { ...existing, state }
      updateBadgeDesign(existing.id as number, designName, state)
        .then(dto => {
          runInAction(() => {
            const idx = this.savedBadgeDesigns.findIndex(d => d.id === dto.id)
            if (idx >= 0) this.savedBadgeDesigns[idx] = this.fromBadgeDto(dto)
          })
        })
        .catch(() => {})
    } else {
      const tempId = Math.random().toString(36).slice(2, 9)
      const design: SavedBadgeDesign = {
        id: tempId,
        designName,
        savedAt: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' }),
        state: { ...state },
      }
      this.savedBadgeDesigns.unshift(design)
      createBadgeDesign(designName, state)
        .then(dto => {
          runInAction(() => {
            const idx = this.savedBadgeDesigns.findIndex(d => d.id === tempId)
            if (idx >= 0) this.savedBadgeDesigns[idx] = this.fromBadgeDto(dto)
          })
        })
        .catch(() => {})
    }
  }

  removeBadgeDesign(id: number | string): void {
    this.savedBadgeDesigns = this.savedBadgeDesigns.filter(d => d.id !== id)
    if (typeof id === 'number') deleteBadgeDesign(id).catch(() => {})
  }

  loadBadgeDesign(design: SavedBadgeDesign): void {
    this.pendingBadgeDesign = design
  }

  consumePendingBadgeDesign(): SavedBadgeDesign | null {
    const d = this.pendingBadgeDesign
    this.pendingBadgeDesign = null
    return d
  }

  saveCertificateDesign(designName: string, state: CertificateState): void {
    const existingIdx = this.savedCertificateDesigns.findIndex(d => d.designName === designName)
    if (existingIdx >= 0) {
      const existing = this.savedCertificateDesigns[existingIdx]
      this.savedCertificateDesigns[existingIdx] = { ...existing, state }
      updateCertificateDesign(existing.id as number, designName, state)
        .then(dto => {
          runInAction(() => {
            const idx = this.savedCertificateDesigns.findIndex(d => d.id === dto.id)
            if (idx >= 0) this.savedCertificateDesigns[idx] = this.fromCertificateDto(dto)
          })
        })
        .catch(() => {})
    } else {
      const tempId = Math.random().toString(36).slice(2, 9)
      const design: SavedCertificateDesign = {
        id: tempId,
        designName,
        savedAt: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' }),
        state: { ...state },
      }
      this.savedCertificateDesigns.unshift(design)
      createCertificateDesign(designName, state)
        .then(dto => {
          runInAction(() => {
            const idx = this.savedCertificateDesigns.findIndex(d => d.id === tempId)
            if (idx >= 0) this.savedCertificateDesigns[idx] = this.fromCertificateDto(dto)
          })
        })
        .catch(() => {})
    }
  }

  removeCertificateDesign(id: number | string): void {
    this.savedCertificateDesigns = this.savedCertificateDesigns.filter(d => d.id !== id)
    if (typeof id === 'number') deleteCertificateDesign(id).catch(() => {})
  }

  loadCertificateDesign(design: SavedCertificateDesign): void {
    this.pendingCertificateDesign = design
  }

  consumePendingCertificateDesign(): SavedCertificateDesign | null {
    const d = this.pendingCertificateDesign
    this.pendingCertificateDesign = null
    return d
  }

  logout(): void {
    this.user = null
    this.savedDesigns = []
    this.pendingDesign = null
    this.savedBadgeDesigns = []
    this.pendingBadgeDesign = null
    this.savedCertificateDesigns = []
    this.pendingCertificateDesign = null
    this.error = null
    setToken(null)
    setRefreshToken(null)
    localStorage.removeItem('user')
  }
}

export default AuthStore
