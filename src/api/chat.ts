import { api } from './client'

export interface ChatMessageDto {
  id: number
  conversationId: number
  senderType: 'User' | 'Admin'
  senderId: number
  text: string
  sentAt: string
  isRead: boolean
}

export function getMyMessages(): Promise<ChatMessageDto[]> {
  return api.get<ChatMessageDto[]>('/api/v1/chat/my/messages')
}

export function getMyConversation(): Promise<{ id: number }> {
  return api.get<{ id: number }>('/api/v1/chat/my')
}
