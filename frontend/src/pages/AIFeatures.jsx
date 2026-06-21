import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiPlanTrip, aiRecommendSeat, aiChat } from '../utils/api'
import toast from 'react-hot-toast'

export default function AIFeatures() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('planner')

  // Trip Planner
  const [planQuery, setPlanQuery] = useState('')
  const [planLoading, setPlanLoading] = useState(false)
  const [planResult, setPlanResult] = useState(null)

  // Seat Advisor
  const [seatForm, setSeatForm] = useState({ journeyHours: 12, budget: 800, travelPurpose: 'general travel', groupSize: 1 })
  const [seatLoading, setSeatLoading] = useState(false)
  const [seatResult, setSeatResult] = useState(null)

  // Chat
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I\'m RailRide AI 🚂 Ask me anything about Indian railways — fares, routes, PNR, cancellations, or booking tips!' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handlePlan = async () => {
    if (!planQuery.trim()) return toast.error('Please describe your journey')
    setPlanLoading(true); setPlanResult(null)
    try {
      const { data } = await aiPlanTrip(planQuery)
      setPlanResult(data)
      if (data.understood) toast.success('AI found your trip!')
    } catch { toast.error('AI unavailable. Please try again.') }
    finally { setPlanLoading(false) }
  }

  const handleSeat = async () => {
    setSeatLoading(true); setSeatResult(null)
    try {
      const { data } = await aiRecommendSeat(seatForm)
      setSeatResult(data)
      toast.success('Recommendation ready!')
    } catch { toast.error('AI unavailable. Please try again.') }
    finally { setSeatLoading(false) }
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userText = chatInput.trim()
    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setChatInput('')
    setChatLoading(true)
    try {
      const history = messages.slice(-8).map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.text }))
      const { data } = await aiChat(userText, history)
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I\'m having trouble right now. Please try again! 🙏' }])
    } finally {
      setChatLoading(false)
    }
  }

  const TABS = [
    { id: 'planner', label: '🗺️ Trip Planner' },
    { id: 'seat',    label: '💺 Seat Advisor' },
    { id: 'chat',    label: '💬 AI Chat' },
  ]

  return (
    <div className="page">
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>✨ AI Features</h2>
          <p className="text-muted text-sm mt-1">Powered by Google Gemini AI — your intelligent railway companion</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '11px 24px', fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? 'var(--orange)' : 'var(--text-muted)',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${tab === t.id ? 'var(--orange)' : 'transparent'}`,
                marginBottom: -2, cursor: 'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TRIP PLANNER ── */}
        {tab === 'planner' && (
          <div>
            <div className="card">
              <div className="card-title">🗺️ Natural Language Trip Planner</div>
              <p className="text-secondary text-sm mb-4">
                Describe your journey in plain English. Our AI understands context, budget, dates, and preferences.
              </p>

              <div className="flex gap-3 mb-3">
                <input
                  className="form-input" style={{ flex: 1, fontSize: 15 }}
                  placeholder='e.g. "Sleeper train from Delhi to Bangalore next Friday, budget ₹600"'
                  value={planQuery}
                  onChange={e => setPlanQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePlan()}
                />
                <button className="btn btn-primary" onClick={handlePlan} disabled={planLoading} style={{ whiteSpace: 'nowrap' }}>
                  {planLoading ? '✨ Thinking...' : '✨ Plan Trip'}
                </button>
              </div>

              {/* Example queries */}
              <div style={{ marginBottom: 16 }}>
                <div className="text-xs text-muted mb-2">Try these examples:</div>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {[
                    'AC train from Mumbai to Delhi tomorrow morning',
                    'Cheapest train Hyderabad to Bangalore on Friday',
                    'Train from Haridwar to Delhi under ₹400 sleeper',
                    'Rajdhani from Delhi to Kolkata next week',
                  ].map(ex => (
                    <button key={ex}
                      style={{ padding: '5px 12px', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: 20, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}
                      onClick={() => { setPlanQuery(ex); setPlanResult(null) }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {planResult && (
                <div className={`alert ${planResult.understood ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 0 }}>
                  {planResult.understood ? (
                    <>
                      <div className="font-bold mb-3" style={{ fontSize: 15 }}>✅ Trip Understood!</div>
                      <div className="grid-3 mb-3">
                        {[
                          ['From', planResult.from],
                          ['To', planResult.to],
                          ['Date', planResult.date || 'Flexible'],
                          ['Class', planResult.preferredClass || 'Any'],
                          ['Passengers', planResult.passengers || 1],
                          ['Budget', planResult.budgetPerPerson ? `₹${planResult.budgetPerPerson}/person` : 'No limit'],
                        ].map(([l, v]) => (
                          <div key={l}>
                            <div style={{ fontSize: 11, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{l}</div>
                            <div className="font-bold" style={{ fontSize: 14 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {planResult.tip && (
                        <div style={{ background: 'white', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                          💡 {planResult.tip}
                        </div>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/search?from=${planResult.fromCode || planResult.from}&to=${planResult.toCode || planResult.to}&date=${planResult.date || ''}&class=${planResult.preferredClass || ''}`)}>
                        Search These Trains →
                      </button>
                    </>
                  ) : (
                    <div>❌ {planResult.error || 'Could not understand your request. Try: "Train from Delhi to Mumbai tomorrow"'}</div>
                  )}
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', border: '1.5px solid #c7d2fe' }}>
              <div className="card-title" style={{ color: 'var(--indigo)' }}>How the Trip Planner works</div>
              <div className="grid-3">
                {[
                  { step: '1', title: 'You describe', desc: 'Type your journey in plain English — any format, any level of detail' },
                  { step: '2', title: 'AI understands', desc: 'Gemini AI extracts cities, dates, budget and class from your text' },
                  { step: '3', title: 'Results appear', desc: 'Matching trains are shown with availability and real-time fares' },
                ].map(s => (
                  <div key={s.step} className="text-center">
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--indigo)', color: 'white', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>{s.step}</div>
                    <div className="font-semibold mb-1" style={{ color: 'var(--navy)' }}>{s.title}</div>
                    <div className="text-sm text-secondary">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SEAT ADVISOR ── */}
        {tab === 'seat' && (
          <div>
            <div className="card">
              <div className="card-title">💺 AI Seat Class Advisor</div>
              <p className="text-secondary text-sm mb-4">
                Tell us about your journey and we'll recommend the best travel class for comfort and value.
              </p>

              <div className="grid-2 mb-4">
                <div className="form-field">
                  <label className="form-label">Journey Duration (hours)</label>
                  <input className="form-input" type="number" min="1" max="72" value={seatForm.journeyHours}
                    onChange={e => setSeatForm(f => ({ ...f, journeyHours: Number(e.target.value) }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Budget per Person (₹)</label>
                  <input className="form-input" type="number" min="100" value={seatForm.budget}
                    onChange={e => setSeatForm(f => ({ ...f, budget: Number(e.target.value) }))} />
                </div>
                <div className="form-field">
                  <label className="form-label">Travel Purpose</label>
                  <select className="form-select" value={seatForm.travelPurpose} onChange={e => setSeatForm(f => ({ ...f, travelPurpose: e.target.value }))}>
                    {['general travel','business','family vacation','pilgrimage','medical','college student'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Number of Travellers</label>
                  <input className="form-input" type="number" min="1" max="6" value={seatForm.groupSize}
                    onChange={e => setSeatForm(f => ({ ...f, groupSize: Number(e.target.value) }))} />
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleSeat} disabled={seatLoading}>
                {seatLoading ? '✨ Analysing...' : '✨ Get Recommendation'}
              </button>

              {seatResult && (
                <div style={{ marginTop: 20, background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', border: '1.5px solid #c7d2fe', borderRadius: 'var(--radius)', padding: 20 }}>
                  <div className="flex gap-4 items-start">
                    <div style={{ background: 'var(--indigo)', color: 'white', borderRadius: 10, padding: '10px 16px', fontWeight: 900, fontSize: 22, flexShrink: 0 }}>
                      {seatResult.recommended}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-bold mb-2" style={{ color: 'var(--indigo)', fontSize: 15 }}>Best class for your journey</div>
                      <p className="text-secondary text-sm mb-3" style={{ lineHeight: 1.6 }}>{seatResult.reason}</p>
                      {seatResult.tips?.map((tip, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'var(--indigo)', marginBottom: 4 }}>• {tip}</div>
                      ))}
                      {seatResult.alternative && (
                        <div className="text-xs text-muted mt-3">
                          Alternative option: <strong>{seatResult.alternative}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Class Guide */}
            <div className="card">
              <div className="card-title">Quick Class Guide</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { cls: '1A', desc: 'First AC — private cabins, premium bedding, highest comfort', fare: '₹₹₹₹' },
                  { cls: '2A', desc: 'Second AC — 2-tier berths, privacy curtains, AC', fare: '₹₹₹' },
                  { cls: '3A', desc: 'Third AC — 3-tier berths, best value for long journeys', fare: '₹₹' },
                  { cls: 'SL', desc: 'Sleeper — non-AC, berths, most affordable overnight option', fare: '₹' },
                  { cls: 'CC', desc: 'Chair Car — day trains, Shatabdi/Vande Bharat, reclining seats', fare: '₹₹' },
                ].map(({ cls, desc, fare }) => (
                  <div key={cls} className="flex items-center gap-3" style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, width: 32, color: 'var(--navy)' }}>{cls}</div>
                    <div className="text-sm text-secondary flex-1">{desc}</div>
                    <div style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 13 }}>{fare}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CHAT ── */}
        {tab === 'chat' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'var(--navy)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>RailRide AI Assistant</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>● Online — Powered by Gemini AI</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ height: 400, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc' }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '78%', padding: '10px 14px', borderRadius: 12,
                  background: m.role === 'user' ? 'var(--orange)' : 'white',
                  color: m.role === 'user' ? 'white' : 'var(--text)',
                  fontSize: 14, lineHeight: 1.5,
                  borderBottomRightRadius: m.role === 'user' ? 3 : 12,
                  borderBottomLeftRadius: m.role === 'user' ? 12 : 3,
                  boxShadow: m.role === 'ai' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                  {m.text}
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '10px 14px', borderRadius: '12px 12px 12px 3px', display: 'flex', gap: 4, alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span className="text-muted text-sm">Thinking...</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Questions */}
            <div style={{ padding: '10px 16px', borderTop: '1.5px solid var(--border)', background: 'white' }}>
              <div className="text-xs text-muted mb-2">Quick questions:</div>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {[
                  'What is the cancellation charge for 3A?',
                  'How to check seat availability?',
                  'Best train Delhi to Mumbai?',
                  'What is Tatkal booking?',
                ].map(q => (
                  <button key={q}
                    style={{ padding: '4px 10px', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: 20, fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}
                    onClick={() => { setChatInput(q) }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', display: 'flex', gap: 10, borderTop: '1.5px solid var(--border)', background: 'white' }}>
              <input
                className="form-input" style={{ flex: 1 }}
                placeholder="Ask about trains, fares, PNR, cancellations..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
              />
              <button className="btn btn-primary" onClick={sendChat} disabled={chatLoading} style={{ padding: '10px 20px' }}>
                Send →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
