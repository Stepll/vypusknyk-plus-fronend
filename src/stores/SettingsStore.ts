import { makeAutoObservable, runInAction } from 'mobx'

async function fetchPublicSettings(): Promise<Record<string, string>> {
  const base = import.meta.env.VITE_API_URL ?? ''
  const res = await fetch(`${base}/api/v1/settings`)
  if (!res.ok) return {}
  return res.json()
}

class SettingsStore {
  settings: Record<string, string> = {}
  loaded = false

  constructor() {
    makeAutoObservable(this)
  }

  async load() {
    const data = await fetchPublicSettings()
    runInAction(() => {
      this.settings = data
      this.loaded = true
    })
  }

  get(key: string, fallback = ''): string {
    return this.settings[key] ?? fallback
  }

  getNumber(key: string, fallback: number): number {
    const v = this.settings[key]
    if (!v) return fallback
    const n = Number(v)
    return isNaN(n) ? fallback : n
  }

  getBool(key: string, fallback = true): boolean {
    const v = this.settings[key]
    if (v === undefined) return fallback
    return v === 'true'
  }
}

export default SettingsStore
