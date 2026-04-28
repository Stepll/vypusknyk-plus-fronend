import { createContext, useContext } from 'react'
import CartStore from './CartStore'
import ToastStore from './ToastStore'
import AuthStore from './AuthStore'
import ChatStore from './ChatStore'

class RootStore {
  cart: CartStore
  toast: ToastStore
  auth: AuthStore
  chat: ChatStore

  constructor() {
    this.cart = new CartStore()
    this.toast = new ToastStore()
    this.auth = new AuthStore()
    this.chat = new ChatStore()
  }
}

const rootStore = new RootStore()

export const RootStoreContext = createContext(rootStore)

export function useRootStore() {
  return useContext(RootStoreContext)
}

export default rootStore
