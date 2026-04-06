import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { 
    Trash2, AlertTriangle, MapPin, Camera, 
    CheckCircle, Loader2, Send, History, 
    X, Info, Clock, Check
} from 'lucide-react'
import Modal from '../components/Modal'

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
    padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
    border: 'none', cursor: 'pointer', width: '100%',
    background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
    color: 'white', boxShadow: '0 4px 12px rgba(76,175,80,0.3)'
}

export default function WasteReporting() {
    const { user, profile } = useAuth()
    const toast = useToast()
    const [tab, setTab] = useState('report')
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        type: 'waste',
        location: '',
        description: '',
        photo: null
    })
    const [photoPreview, setPhotoPreview] = useState(null)

    const LOCATIONS = [
        'Main Canteen', 'Library Corridor', 'Admin Gate', 'Hostel A Block', 
        'Hostel B Block', 'Sports Complex', 'Auditorium', 'CS Lab Entrance'
    ]

    useEffect(() => {
        loadReports()
    }, [])

    async function loadReports() {
        try {
            const data = await db.query('waste_reports', { user_id: user.id })
            setReports(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
        } catch (err) { console.error(err) }
    }

    function handlePhoto(e) {
        const file = e.target.files[0]
        if (!file) return
        setForm(p => ({ ...p, photo: file }))
        const reader = new FileReader()
        reader.onload = (ev) => setPhotoPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.location) { toast.warning('Please select a location'); return }
        setLoading(true)
        
        try {
            let photoUrl = null
            if (form.photo) {
                const fileName = `${user.id}-${Date.now()}-${form.photo.name}`
                const data = await db.upload('waste_reports_images', fileName, form.photo)
                photoUrl = data.url
            }

            await db.insert('waste_reports', {
                user_id: user.id,
                type: form.type,
                location: form.location,
                description: form.description,
                photo_url: photoUrl,
                status: 'pending' // pending, resolved, investigation
            })
            
            toast.success('Report submitted! Campus staff notified. 🚀')
            setForm({ type: 'waste', location: '', description: '', photo: null })
            setPhotoPreview(null)
            await loadReports()
        } catch (err) {
            toast.error('Failed to submit report')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Complaints & Reports</h1>
                <p style={{ color: '#9ca3af', marginTop: '4px' }}>Help us keep our campus clean, functional, and sustainable</p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setTab('report')} style={{
                    ...btnGreen, width: 'auto', background: tab === 'report' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'white',
                    color: tab === 'report' ? 'white' : '#6b7280', border: tab === 'report' ? 'none' : '1px solid #e5e7eb', boxShadow: tab === 'report' ? '0 4px 12px rgba(76,175,80,0.3)' : 'none'
                }}>
                    <Trash2 size={16} /> New Report
                </button>
                <button onClick={() => setTab('history')} style={{
                    ...btnGreen, width: 'auto', background: tab === 'history' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'white',
                    color: tab === 'history' ? 'white' : '#6b7280', border: tab === 'history' ? 'none' : '1px solid #e5e7eb', boxShadow: tab === 'history' ? '0 4px 12px rgba(76,175,80,0.3)' : 'none'
                }}>
                    <History size={16} /> My Reports
                </button>
            </div>

            {tab === 'report' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }} className="report-grid">
                    <div style={{ ...card, padding: '24px' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Report Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        { key: 'waste', label: 'Waste Issue', icon: Trash2 },
                                        { key: 'maintenance', label: 'Maintenance / Other', icon: AlertTriangle }
                                    ].map(item => (
                                        <button key={item.key} type="button" onClick={() => setForm(p => ({ ...p, type: item.key }))} style={{
                                            padding: '16px', borderRadius: '12px', border: `2px solid ${form.type === item.key ? '#66bb6a' : '#f3f4f6'}`,
                                            background: form.type === item.key ? '#f0fdf4' : 'white', color: form.type === item.key ? '#166534' : '#6b7280',
                                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                                        }}>
                                            <item.icon size={24} /> {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Location *</label>
                                <select style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}>
                                    <option value="">Select location...</option>
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Description (optional)</label>
                                <textarea style={{ ...inputStyle, minHeight: '100px' }} placeholder="Add more details about the issue..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </div>

                            <button type="submit" disabled={loading} style={btnGreen}>
                                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ ...card, padding: '24px', textAlign: 'center' }}>
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #4caf50' }}>
                                    <Camera size={32} color="#4caf50" />
                                </div>
                                <div>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>Add Photo</span>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Capture or upload an image</p>
                                </div>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                            </label>

                            {photoPreview && (
                                <div style={{ marginTop: '20px', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                                    <img src={photoPreview} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                    <button onClick={() => { setPhotoPreview(null); setForm(p => ({ ...p, photo: null })) }} style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ ...card, padding: '24px', background: '#eff6ff', border: '1px solid #dbeafe' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Info size={18} color="#2563eb" />
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af' }}>How it works?</h4>
                                    <p style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '6px', lineHeight: 1.5 }}>Reports are sent directly to campus facility management. Real-time monitoring helps them address issues and manage campus facilities effectively.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ ...card, padding: '24px' }}>
                    {reports.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {reports.map((r, i) => (
                                <div key={i} style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: r.type === 'waste' ? '#fee2e2' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {r.type === 'waste' ? <Trash2 color="#dc2626" /> : <AlertTriangle color="#d97706" />}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>{r.type === 'waste' ? 'Waste Issue' : 'Maintenance / Other'}</h4>
                                            <p style={{ fontSize: '13px', color: '#6b7280' }}>📍 {r.location} · {new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, 
                                            background: r.status === 'resolved' ? '#dcfce7' : r.status === 'dismissed' ? '#fef2f2' : '#fef3c7', 
                                            color: r.status === 'resolved' ? '#166534' : r.status === 'dismissed' ? '#dc2626' : '#92400e',
                                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            {r.status === 'resolved' ? <Check size={12} /> : r.status === 'dismissed' ? <X size={12} /> : <Clock size={12} />}
                                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                            <History size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p>You haven't reported any issues yet.</p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    .report-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}
