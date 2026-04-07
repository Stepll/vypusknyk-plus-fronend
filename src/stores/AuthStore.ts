import { makeAutoObservable } from 'mobx'
import { RibbonState } from '../constants/ribbonRules'

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
  savedDesigns: SavedDesign[] = []
  pendingDesign: SavedDesign | null = null

  constructor() {
    makeAutoObservable(this)
  }

  get isLoggedIn(): boolean {
    return this.user !== null
  }

  async login(email: string, password: string): Promise<void> {
    this.loading = true
    await new Promise(r => setTimeout(r, 700))
    this.user = {
      id: '1',
      email,
      name: email.split('@')[0],
      fullName: '',
      phone: '',
    }
    this.loading = false
  }

  async register(email: string, password: string): Promise<void> {
    this.loading = true
    await new Promise(r => setTimeout(r, 700))
    this.user = {
      id: '1',
      email,
      name: email.split('@')[0],
      fullName: '',
      phone: '',
    }
    this.loading = false
  }

  async updateProfile(fullName: string, phone: string): Promise<void> {
    if (!this.user) return
    this.loading = true
    await new Promise(r => setTimeout(r, 500))
    this.user.fullName = fullName
    this.user.phone = phone
    this.user.name = fullName.trim() || this.user.email.split('@')[0]
    this.loading = false
  }

  async updatePassword(_newPassword: string): Promise<void> {
    this.loading = true
    await new Promise(r => setTimeout(r, 500))
    this.loading = false
  }

  saveDesign(designName: string, state: RibbonState): void {
    const existing = this.savedDesigns.findIndex(d => d.designName === designName)
    const design: SavedDesign = {
      id: existing >= 0 ? this.savedDesigns[existing].id : Math.random().toString(36).slice(2, 9),
      designName,
      savedAt: new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' }),
      state: { ...state },
    }
    if (existing >= 0) {
      this.savedDesigns[existing] = design
    } else {
      this.savedDesigns.unshift(design)
    }
  }

  removeDesign(id: string): void {
    this.savedDesigns = this.savedDesigns.filter(d => d.id !== id)
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
  }
}

export default AuthStore
