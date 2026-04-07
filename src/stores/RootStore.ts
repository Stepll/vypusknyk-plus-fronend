import { createContext, useContext } from 'react'
import CartStore from './CartStore'
import ToastStore from './ToastStore'
import AuthStore from './AuthStore'

class RootStore {
  cart: CartStore
  toast: ToastStore
  auth: AuthStore

  constructor() {
    this.cart = new CartStore()
    this.toast = new ToastStore()
    this.auth = new AuthStore()
  }
}

const rootStore = new RootStore()

export const RootStoreContext = createContext(rootStore)

export function useRootStore() {
  return useContext(RootStoreContext)
}

export default rootStore
