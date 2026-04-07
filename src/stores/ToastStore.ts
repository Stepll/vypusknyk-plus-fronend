import { makeAutoObservable } from 'mobx'

export interface ToastMessage {
  id: string
  text: string
}

class ToastStore {
  messages: ToastMessage[] = []

  constructor() {
    makeAutoObservable(this)
  }

  show(text: string) {
    const id = Math.random().toString(36).slice(2, 9)
    this.messages.push({ id, text })
    setTimeout(() => this.dismiss(id), 5000)
  }

  dismiss(id: string) {
    this.messages = this.messages.filter(m => m.id !== id)
  }
}

export default ToastStore
