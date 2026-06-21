import { useState, useRef, useEffect } from 'react'
import { aiChat } from '../utils/api'

export default function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m RailRide AI 🚂 Ask me anything about trains, booking, PNR or cancellations!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.text }))
      const { data } = await aiChat(text, history)
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, temporarily unavailable. Please try again! 🙏' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-float">
      {open ? (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header__avatar">🤖</div>
            <div>
              <div className="chat-header__name">RailRide AI</div>
              <div className="chat-header__status">● Online</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.role === 'user' ? 'user' : 'ai'}`}>{m.text}</div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg--ai" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="chat-footer">
            <input
              className="chat-input"
              placeholder="Ask about trains..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="chat-send" onClick={send} disabled={loading}>➤</button>
          </div>
        </div>
      ) : (
        <button className="chat-toggle" onClick={() => setOpen(true)} title="Chat with RailRide AI">
          🤖
        </button>
      )}
    </div>
  )
}
