import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiPlanTrip } from '../utils/api'
import toast from 'react-hot-toast'

const CITIES = [
  'NEW DELHI - NDLS','MUMBAI CENTRAL - MMCT','BANGALORE - SBC',
  'CHENNAI CENTRAL - MAS','HOWRAH - HWH','HYDERABAD - HYB',
  'PUNE - PUNE','AHMEDABAD - ADI','JAIPUR - JP','LUCKNOW - LKO',
  'PATNA - PNBE','VARANASI - BSB','AMRITSAR - ASR','BHOPAL - BPL',
  'DIBAI - DIB','MATHURA - MTJ',
]

export default function Home() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ from: 'NEW DELHI - NDLS', to: 'MUMBAI CENTRAL - MMCT', date: '', travelClass: '' })
  const [aiQuery, setAiQuery] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  const handleSearch = (e) => {
    e.preventDefault()
    const from = form.from.split(' - ')[1] || form.from
    const to = form.to.split(' - ')[1] || form.to
    navigate(`/search?from=${from}&to=${to}&date=${form.date}&class=${form.travelClass}`)
  }

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return toast.error('Please type a travel query first')
    setAiLoading(true); setAiResult(null)
    try {
      const { data } = await aiPlanTrip(aiQuery)
      setAiResult(data)
      if (data.understood) {
        toast.success('AI found your trip!')
      }
    } catch {
      toast.error('AI is temporarily unavailable')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="search-section">
        <div className="search-panel">
          <h2 className="search-panel__title">Train Search</h2>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="form-field">
              <label className="form-label">From City</label>
              <select className="form-select" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">To City</label>
              <select className="form-select" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Journey Date</label>
              <input type="date" className="form-input" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Class</label>
              <select className="form-select" value={form.travelClass} onChange={e => setForm({ ...form, travelClass: e.target.value })}>
                <option value="">All Classes</option>
                {['SL','3A','2A','1A','CC','EC','2S'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '11px 28px' }}>
              🔍 Search
            </button>
          </form>

          {/* AI Bar */}
          <div className="ai-bar">
            <span className="ai-bar__icon">✨</span>
            <div style={{ flex: 1 }}>
              <div className="ai-bar__label">AI Trip Planner</div>
              <input
                className="ai-bar__input"
                placeholder='Try: "Sleeper train from Delhi to Mumbai tomorrow under ₹800"'
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
              />
            </div>
            <button className="btn btn-indigo btn-sm" onClick={handleAiSearch} disabled={aiLoading}>
              {aiLoading ? 'Thinking...' : 'Ask AI →'}
            </button>
          </div>

          {aiResult && (
            <div className={`alert mt-3 ${aiResult.understood ? 'alert-success' : 'alert-error'}`}>
              {aiResult.understood ? (
                <div>
                  <div className="font-bold mb-2">✅ Trip Understood: {aiResult.from} → {aiResult.to}
                    {aiResult.date && ` • ${aiResult.date}`}
                    {aiResult.preferredClass && ` • ${aiResult.preferredClass} class`}
                  </div>
                  {aiResult.tip && <div className="text-sm mb-3">💡 {aiResult.tip}</div>}
                  <button className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/search?from=${aiResult.fromCode || aiResult.from}&to=${aiResult.toCode || aiResult.to}&date=${aiResult.date || ''}&class=${aiResult.preferredClass || ''}`)}>
                    Search These Trains →
                  </button>
                </div>
              ) : (
                <div>❌ {aiResult.error || 'Could not understand. Try: "Train from Delhi to Mumbai tomorrow"'}</div>
              )}
            </div>
          )}
        </div>
      </div>

    {/* Quick examples */}
      <div style={{ padding: '12px 32px 0', textAlign: 'center' }}>
        <p className="text-sm text-muted mb-2">Popular routes:</p>
        <div className="flex gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['NDLS','MMCT','Delhi → Mumbai'],['NDLS','SBC','Delhi → Bangalore'],['NDLS','HWH','Delhi → Kolkata'],['HYB','NDLS','Hyderabad → Delhi']].map(([from, to, label]) => (
            <button key={label} className="btn btn-outline btn-sm"
              onClick={() => navigate(`/search?from=${from}&to=${to}`)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Train illustration */}
      <div style={{ padding: '12px 16px 0', display: 'flex', justifyContent: 'center' }}>
        <svg width="100%" height="100" viewBox="0 0 1000 220" style={{ maxWidth: 980 }}>
          <line x1="0" y1="190" x2="1000" y2="190" stroke="var(--border)" strokeWidth="2" />
          <line x1="0" y1="196" x2="1000" y2="196" stroke="#cbd5e1" strokeWidth="3" />
          {[...Array(50)].map((_, i) => (
            <rect key={i} x={i * 20} y="194" width="10" height="6" fill="#cbd5e1" />
          ))}
          <g>
            <rect x="40" y="100" width="160" height="70" rx="10" fill="var(--navy)" />
            <rect x="52" y="115" width="34" height="28" rx="4" fill="var(--orange)" />
            <rect x="94" y="115" width="34" height="28" rx="4" fill="var(--orange)" />
            <rect x="136" y="115" width="34" height="28" rx="4" fill="var(--orange)" />
            <circle cx="65" cy="178" r="14" fill="var(--navy-dark)" />
            <circle cx="175" cy="178" r="14" fill="var(--navy-dark)" />
            <rect x="30" y="90" width="20" height="14" rx="3" fill="var(--navy)" />

            <rect x="220" y="110" width="150" height="60" rx="8" fill="var(--orange)" />
            <rect x="232" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <rect x="270" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <rect x="308" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <circle cx="245" cy="178" r="12" fill="var(--navy-dark)" />
            <circle cx="345" cy="178" r="12" fill="var(--navy-dark)" />

            <rect x="390" y="110" width="150" height="60" rx="8" fill="var(--navy-light)" />
            <rect x="402" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <rect x="440" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <rect x="478" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <circle cx="415" cy="178" r="12" fill="var(--navy-dark)" />
            <circle cx="515" cy="178" r="12" fill="var(--navy-dark)" />

            <rect x="560" y="110" width="150" height="60" rx="8" fill="var(--orange)" />
            <rect x="572" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <rect x="610" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <rect x="648" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <circle cx="585" cy="178" r="12" fill="var(--navy-dark)" />
            <circle cx="685" cy="178" r="12" fill="var(--navy-dark)" />

            <rect x="730" y="110" width="150" height="60" rx="8" fill="var(--navy-light)" />
            <rect x="742" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <rect x="780" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <rect x="818" y="124" width="28" height="24" rx="3" fill="white" opacity="0.9" />
            <circle cx="755" cy="178" r="12" fill="var(--navy-dark)" />
            <circle cx="855" cy="178" r="12" fill="var(--navy-dark)" />
          </g>
        </svg>
      </div>

      {/* Why Railride */}
      <div style={{ padding: '8px 32px 0' }}>
        <div className="grid-3" style={{ maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: '🎟️', title: 'Instant booking', desc: 'Confirm your seat in seconds' },
            { icon: '✨', title: 'AI trip planning', desc: 'Describe your journey, AI handles the rest' },
            { icon: '🔒', title: 'Secure & reliable', desc: 'Your data is always protected' },
          ].map(f => (
            <div key={f.title} className="text-center" style={{ padding: '8px 16px' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{f.icon}</div>
              <div className="font-semibold mb-1" style={{ color: 'var(--navy)', fontSize: 14 }}>{f.title}</div>
              <div className="text-sm text-secondary" style={{ fontSize: 12 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}