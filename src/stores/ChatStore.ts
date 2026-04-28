import { makeAutoObservable, runInAction } from 'mobx'
import * as signalR from '@microsoft/signalr'
import * as api from '../api/chat'
import type { ChatMessageDto } from '../api/chat'
import { getToken } from '../api/token'

const HUB_URL = `${import.meta.env.VITE_API_URL ?? ''}/hubs/chat`

class ChatStore {
  messages: ChatMessageDto[] = []
  conversationId: number | null = null
  isOpen = false
  isConnected = false
  unreadCount = 0

  private connection: signalR.HubConnection | null = null

  constructor() {
    makeAutoObservable(this)
  }

  async connect() {
    const token = getToken()
    if (!token || this.connection?.state === signalR.HubConnectionState.Connected) return

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build()

    conn.on('ReceiveMessage', (msg: ChatMessageDto) => {
      runInAction(() => {
        this.messages.push(msg)
        if (!this.isOpen && msg.senderType === 'Admin') {
          this.unreadCount++
        }
      })
    })

    conn.onreconnected(() => runInAction(() => { this.isConnected = true }))
    conn.onclose(() => runInAction(() => { this.isConnected = false }))

    await conn.start()

    const conv = await api.getMyConversation()
    const msgs = await api.getMyMessages()

    runInAction(() => {
      this.connection = conn
      this.isConnected = true
      this.conversationId = conv.id
      this.messages = msgs
    })

    await conn.invoke('JoinConversation', conv.id)
  }

  async disconnect() {
    await this.connection?.stop()
    runInAction(() => {
      this.connection = null
      this.isConnected = false
    })
  }

  async sendMessage(text: string) {
    if (!this.conversationId || !text.trim()) return
    await this.connection?.invoke('SendMessage', this.conversationId, text)
  }

  async open() {
    this.isOpen = true
    this.unreadCount = 0
    if (this.conversationId) {
      await this.connection?.invoke('MarkRead', this.conversationId)
    }
  }

  close() {
    this.isOpen = false
  }
}

export default ChatStore
