import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../stores/RootStore'

const ChatWidget = observer(() => {
  const { auth, chat } = useRootStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (auth.isLoggedIn) {
      chat.connect()
      return () => { chat.disconnect() }
    }
  }, [auth.isLoggedIn])

  useEffect(() => {
    if (chat.isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat.messages.length, chat.isOpen])

  if (!auth.isLoggedIn) return null

  const handleSend = async () => {
    if (!input.trim()) return
    await chat.sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      {!chat.isOpen && (
        <button
          onClick={() => chat.open()}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e91e8c 0%, #c2185b 100%)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(233,30,140,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          {chat.unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: '#fff',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {chat.unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {chat.isOpen && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 340, height: 480,
          background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #e91e8c 0%, #c2185b 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Підтримка</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Випускник+</div>
              </div>
            </div>
            <button
              onClick={() => chat.close()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1,
                padding: 4,
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {chat.messages.length === 0 && (
              <div style={{
                textAlign: 'center', color: '#bfbfbf', fontSize: 13,
                marginTop: 40, padding: '0 20px',
              }}>
                Вітаємо! Як ми можемо вам допомогти?
              </div>
            )}
            {chat.messages.map(msg => {
              const isUser = msg.senderType === 'User'
              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  marginBottom: 8,
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser
                      ? 'linear-gradient(135deg, #e91e8c 0%, #c2185b 100%)'
                      : '#f5f5f5',
                    color: isUser ? '#fff' : '#262626',
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    <div>{msg.text}</div>
                    <div style={{
                      fontSize: 10, marginTop: 3,
                      opacity: 0.65, textAlign: 'right',
                    }}>
                      {new Date(msg.sentAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex', gap: 8, flexShrink: 0,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Написати повідомлення..."
              style={{
                flex: 1, border: '1px solid #e8e8e8', borderRadius: 20,
                padding: '7px 14px', fontSize: 13, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: input.trim()
                  ? 'linear-gradient(135deg, #e91e8c 0%, #c2185b 100%)'
                  : '#f0f0f0',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" fill={input.trim() ? 'white' : '#bfbfbf'} viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
})

export default ChatWidget
