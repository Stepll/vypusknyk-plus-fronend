import { createContext, useContext } from 'react'
import CartStore from './CartStore'
import ToastStore from './ToastStore'
import AuthStore from './AuthStore'
import ChatStore from './ChatStore'
import SettingsStore from './SettingsStore'

class RootStore {
  cart: CartStore
  toast: ToastStore
  auth: AuthStore
  chat: ChatStore
  settings: SettingsStore

  constructor() {
    this.cart = new CartStore()
    this.toast = new ToastStore()
    this.auth = new AuthStore()
    this.chat = new ChatStore()
    this.settings = new SettingsStore()
  }
}

const rootStore = new RootStore()

export const RootStoreContext = createContext(rootStore)

export function useRootStore() {
  return useContext(RootStoreContext)
}

export default rootStore
