import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { calculateCO2 } from '../lib/co2Calculator'
import { analyzeLifestyle, COMMUTE_OPTIONS, DIET_OPTIONS } from '../lib/carbonEstimator'
import {
    Footprints, Utensils, Zap, Trash2, Plus, History,
    CheckCircle, Loader2, ChevronDown, Lightbulb, Calendar,
    Brain, Car, BarChart3, AlertTriangle, RotateCcw, Leaf, TrendingDown,
    Globe, Target, Home, ShoppingBag, Thermometer,
    Sparkles, TrendingUp, Award, Activity, Shield, Info
} from 'lucide-react'

const TRANSPORT_MODES = [
    { value: 'walk', label: '🚶 Walk', eco: true },
    { value: 'bicycle', label: '🚲 Bicycle', eco: true },
    { value: 'bus', label: '🚌 Bus', eco: false },
    { value: 'bike', label: '🏍️ Motorbike', eco: false },
    { value: 'carpool', label: '🚗 Carpool', eco: true },
    { value: 'car', label: '🚘 Car (solo)', eco: false },
]

const FOOD_TYPES = [
    { value: 'veg', label: '🥗 Vegetarian', eco: true },
    { value: 'mixed', label: '🍽️ Mixed', eco: false },
    { value: 'non-veg', label: '🍖 Non-Vegetarian', eco: false },
]

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}
const inputStyle = {
    width: '100%', padding: '12px 16px', border: '2px solid #e8f5e9',
    borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
    outline: 'none', background: 'white', boxSizing: 'border-box'
}
const btnGreen = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '14px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
    border: 'none', cursor: 'pointer', width: '100%',
    background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
    color: 'white', boxShadow: '0 4px 12px rgba(76,175,80,0.3)'
}

const optionBtn = (isActive) => ({
    padding: '12px', borderRadius: '12px', border: `2px solid ${isActive ? '#66bb6a' : '#f3f4f6'}`,
    background: isActive ? '#e8f5e9' : 'white', cursor: 'pointer',
    fontSize: '14px', fontWeight: 500, textAlign: 'left', transition: 'all 0.2s'
})

export default function CO2Tracking() {
    const { user, profile, updateProfile } = useAuth()
    const toast = useToast()
    const [activeTab, setActiveTab] = useState('log')
    const [category, setCategory] = useState('transport')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [dateFilter, setDateFilter] = useState('week')

    const [form, setForm] = useState({
        transportMode: 'walk', km: '',
        electricityHours: '', devices: ['laptop']
    })

    useEffect(() => { if (activeTab === 'history') loadHistory() }, [activeTab, dateFilter])

    async function loadHistory() {
        if (!user) return
        setHistoryLoading(true)
        try {
            const now = new Date()
            let fromDate
            if (dateFilter === 'week') fromDate = new Date(now.getTime() - 7 * 86400000)
            else if (dateFilter === 'month') fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
            else fromDate = new Date(2020, 0, 1)

            const data = await db.query('co2_logs', { user_id: user.id })
            const filtered = data
                .filter(l => new Date(l.created_at) >= fromDate)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            setHistory(filtered)
        } catch (err) { console.error(err) }
        finally { setHistoryLoading(false) }
    }

    function updateForm(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

    function toggleDevice(device) {
        setForm(prev => ({
            ...prev,
            devices: prev.devices.includes(device) ? prev.devices.filter(d => d !== device) : [...prev.devices, device]
        }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true); setResult(null)
        try {
            const entry = {
                transportMode: category === 'transport' ? form.transportMode : null,
                km: category === 'transport' ? parseFloat(form.km) || 0 : 0,
                electricityHours: category === 'electricity' ? parseFloat(form.electricityHours) || 0 : 0,
                devices: category === 'electricity' ? form.devices : [],
            }
            const calc = calculateCO2(entry)
            // No points for CO2 logging as per request
            const finalPoints = 0

            await db.insert('co2_logs', {
                user_id: user.id, 
                category,
                sub_category: category === 'transport' ? entry.transportMode : null,
                co2_kg: calc.totalCO2, 
                points_earned: finalPoints,
                metadata: {
                    transportMode: entry.transportMode,
                    km: entry.km || null,
                    electricityHours: entry.electricityHours || null,
                    devices: entry.devices || []
                }
            })
            setResult({ ...calc, totalPoints: finalPoints })
            toast.success(`Logged ${calc.totalCO2} kg CO2! 🌿`)
        } catch (err) { toast.error(err.message || 'Failed to log entry') }
        finally { setLoading(false) }
    }

    const CATEGORIES = [
        { key: 'transport', icon: Footprints, label: 'Transport', color: '#4caf50' },
        { key: 'electricity', icon: Zap, label: 'Electricity', color: '#3b82f6' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>CO2 Tracking</h1>
                <p style={{ color: '#9ca3af', marginTop: '4px' }}>Log your daily activities, view history, and estimate your carbon footprint</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[{ key: 'log', icon: Plus, label: 'Log Entry' }, { key: 'history', icon: History, label: 'History' }].map(t => {
                    const isActive = activeTab === t.key
                    return (
                        <button key={t.key} onClick={() => { setActiveTab(t.key); if (t.key === 'log') setResult(null); }} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
                            border: 'none', cursor: 'pointer',
                            background: isActive ? '#4caf50' : 'white',
                            color: isActive ? 'white' : '#6b7280',
                            boxShadow: isActive ? '0 4px 12px rgba(76,175,80,0.3)' : 'none'
                        }}>
                            <t.icon size={16} /> {t.label}
                        </button>
                    )
                })}
            </div>

            {activeTab === 'log' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }} className="co2-grid">
                    <div>
                        {/* Category Selector */}
                        <div style={{ ...card, padding: '24px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563', marginBottom: '12px' }}>Select Category</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }} className="cat-grid">
                                {CATEGORIES.map(cat => (
                                    <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                        padding: '16px', borderRadius: '12px', cursor: 'pointer',
                                        border: `2px solid ${category === cat.key ? '#66bb6a' : '#f3f4f6'}`,
                                        background: category === cat.key ? '#e8f5e9' : 'white'
                                    }}>
                                        <cat.icon size={22} color={category === cat.key ? '#43a047' : '#9ca3af'} />
                                        <span style={{ fontSize: '14px', fontWeight: 500, color: category === cat.key ? '#2e7d32' : '#6b7280' }}>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div style={{ ...card, padding: '24px' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {category === 'transport' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Mode of Transport</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }} className="mode-grid">
                                                {TRANSPORT_MODES.map(m => (
                                                    <button key={m.value} type="button" onClick={() => updateForm('transportMode', m.value)} style={optionBtn(form.transportMode === m.value)}>
                                                        {m.label}
                                                        {m.eco && <span style={{ display: 'block', fontSize: '10px', color: '#4caf50' }}>Eco-friendly</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Distance (km)</label>
                                            <input type="number" style={inputStyle} placeholder="e.g. 5" value={form.km} onChange={e => updateForm('km', e.target.value)} min="0" step="0.1" />
                                        </div>
                                    </>
                                )}



                                {category === 'electricity' && (
                                    <>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Devices Used</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {['fan', 'light', 'laptop', 'ac'].map(d => (
                                                    <button key={d} type="button" onClick={() => toggleDevice(d)} style={{
                                                        padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
                                                        textTransform: 'capitalize', cursor: 'pointer',
                                                        border: `2px solid ${form.devices.includes(d) ? '#66bb6a' : '#f3f4f6'}`,
                                                        background: form.devices.includes(d) ? '#e8f5e9' : 'white',
                                                        color: form.devices.includes(d) ? '#2e7d32' : '#6b7280'
                                                    }}>
                                                        {d === 'ac' ? 'AC' : d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Hours of Usage</label>
                                            <input type="number" style={inputStyle} placeholder="e.g. 3" value={form.electricityHours} onChange={e => updateForm('electricityHours', e.target.value)} min="0" step="0.5" />
                                        </div>
                                    </>
                                )}

                                {category === 'waste' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Waste Action</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                            {[{ value: 'recycled', label: '♻️ Recycled' }, { value: 'composted', label: '🌿 Composted' }, { value: 'none', label: '🗑️ Regular' }].map(w => (
                                                <button key={w.value} type="button" onClick={() => updateForm('wasteAction', w.value)} style={optionBtn(form.wasteAction === w.value)}>
                                                    {w.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button type="submit" disabled={loading} style={btnGreen}>
                                    {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
                                    {loading ? 'Logging...' : 'Log Activity'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Result Card */}
                    <div>
                        {result ? (
                            <div style={{ ...card, padding: '24px', border: '2px solid #a5d6a7', background: 'linear-gradient(135deg, #e8f5e9, #ecfdf5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <CheckCircle size={20} color="#4caf50" />
                                    <h3 style={{ fontWeight: 700, color: '#2e7d32' }}>Activity Logged!</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '12px' }}>
                                        <span style={{ fontSize: '14px', color: '#6b7280' }}>CO2 Emitted</span>
                                        <span style={{ fontWeight: 700, color: '#1f2937' }}>{result.totalCO2} kg</span>
                                    </div>
                                    {result.totalPoints > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '12px' }}>
                                            <span style={{ fontSize: '14px', color: '#6b7280' }}>EcoPoints Earned</span>
                                            <span style={{ fontWeight: 700, color: '#43a047' }}>+{result.totalPoints} pts</span>
                                        </div>
                                    )}
                                    {Object.entries(result.breakdown).map(([key, val]) => (
                                        <div key={key} style={{ padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px' }}>
                                            <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>{key}</p>
                                            <p style={{ fontSize: '14px', color: '#4b5563' }}>{val.co2.toFixed(2)} kg CO2 · {val.points} pts</p>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '16px', padding: '12px', background: '#fffde7', borderRadius: '12px', display: 'flex', gap: '8px' }}>
                                    <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <p style={{ fontSize: '12px', color: '#b45309' }}>
                                        {result.totalCO2 < 1 ? "Great job! Your emissions are low today. Keep it up! 🌟" : "Consider eco-friendly alternatives to reduce your footprint. Every bit helps! 🌱"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ ...card, padding: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌿</div>
                                <h3 style={{ fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Track Your Impact</h3>
                                <p style={{ fontSize: '14px', color: '#9ca3af' }}>Log your daily activities and see how your choices affect the planet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                /* History Tab */
                <div style={{ ...card, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ fontWeight: 600, color: '#374151' }}>Activity History</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['week', 'month', 'all'].map(f => (
                                <button key={f} onClick={() => setDateFilter(f)} style={{
                                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                                    textTransform: 'capitalize', border: 'none', cursor: 'pointer',
                                    background: dateFilter === f ? '#4caf50' : '#f3f4f6',
                                    color: dateFilter === f ? 'white' : '#6b7280'
                                }}>
                                    {f === 'all' ? 'All Time' : `This ${f}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {historyLoading ? (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <Loader2 size={24} color="#4caf50" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                        </div>
                    ) : history.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#9ca3af' }}>
                                        <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Date</th>
                                        <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Category</th>
                                        <th style={{ paddingBottom: '12px', fontWeight: 500 }}>Details</th>
                                        <th style={{ paddingBottom: '12px', fontWeight: 500, textAlign: 'right' }}>CO2 (kg)</th>
                                        <th style={{ paddingBottom: '12px', fontWeight: 500, textAlign: 'right' }}>Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(log => (
                                        <tr key={log.id} style={{ borderTop: '1px solid #f9fafb' }}>
                                            <td style={{ padding: '12px 0', color: '#4b5563' }}>{new Date(log.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px 0' }}>
                                                <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '8px', background: '#e8f5e9', color: '#2e7d32', fontSize: '12px', fontWeight: 500, textTransform: 'capitalize' }}>{log.category}</span>
                                            </td>
                                            <td style={{ padding: '12px 0', color: '#6b7280' }}>
                                                {log.metadata?.transportMode && `${log.metadata.transportMode} · ${log.metadata.km} km`}
                                                {log.metadata?.electricityHours && `${log.metadata.electricityHours} hrs`}
                                            </td>
                                            <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 500 }}>{Number(log.co2_kg).toFixed(2)}</td>
                                            <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 500, color: '#43a047' }}>+{log.points_earned}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                            <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p>No entries found for this period</p>
                        </div>
                    )}
                </div>
            )}
            
            <style>{`
                @media (max-width: 640px) {
                    .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .mode-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .transport-grid { grid-template-columns: repeat(3, 1fr) !important; }
                }
            `}</style>
        </div>
    )
}
