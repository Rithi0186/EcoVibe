import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { 
    Calendar, MapPin, Award, QrCode, Users, 
    ArrowRight, CheckCircle, Loader2, Sparkles, 
    Smartphone, Search, Filter, Leaf, Info,
    Check, X, Zap
} from 'lucide-react'
import Modal from '../components/Modal'

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}

export default function EcoDrives() {
    const { user, profile, updateProfile } = useAuth()
    const toast = useToast()
    const [drives, setDrives] = useState([])
    const [myParticipation, setMyParticipation] = useState([])
    const [loading, setLoading] = useState(true)
    const [showScanner, setShowScanner] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [scannedDrive, setScannedDrive] = useState(null)
    const [manualCode, setManualCode] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const allDrives = await db.getAll('eco_drives')
            const participation = await db.query('drive_participation', { user_id: user.id })
            setDrives(allDrives)
            setMyParticipation(participation)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    function handleScan(driveId) {
        setScanning(true)
        setTimeout(() => {
            const drive = drives.find(d => d.id === driveId)
            setScannedDrive(drive)
            setScanning(false)
        }, 1500)
    }

    function handleCodeSubmit(e) {
        e?.preventDefault()
        if (!manualCode.trim()) return
        
        const drive = drives.find(d => d.code === manualCode.trim())
        if (!drive) {
            toast.error('Invalid drive code! Please check again.')
            return
        }
        
        setScanning(true)
        setTimeout(() => {
            setScannedDrive(drive)
            setManualCode('')
            setScanning(false)
        }, 1000)
    }

    async function confirmJoin() {
        if (!scannedDrive) return
        
        const isJoined = myParticipation.some(p => p.drive_id === scannedDrive.id)
        if (isJoined) {
            toast.warning('You are already registered for this drive!')
            setShowScanner(false)
            setScannedDrive(null)
            return
        }

        try {
            await db.insert('drive_participation', {
                user_id: user.id,
                drive_id: scannedDrive.id,
                joined_at: new Date().toISOString()
            })

            // Award points for participating
            if (profile) {
                const newPoints = (profile.eco_points || 0) + (scannedDrive.points || 0)
                await updateProfile({
                    eco_points: newPoints
                })
            }

            toast.success(`You've joined "${scannedDrive.title}"! Earned ${scannedDrive.points} EcoPoints! 🌿`)
            setShowScanner(false)
            setScannedDrive(null)
            await loadData()
        } catch (err) {
            toast.error('Failed to join drive')
        }
    }

    const isParticipating = (driveId) => myParticipation.some(p => p.drive_id === driveId)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Eco Drives Participation</h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px' }}>Join campus drives for tree plantation, cleanups, and more</p>
                </div>
                <button onClick={() => setShowScanner(true)} style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, 
                    border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', 
                    color: 'white', boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
                }}>
                    <Smartphone size={18} /> Scan QR / Enter Code
                </button>
            </div>

            {/* Upcoming Drives */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {drives.map((drive, i) => {
                    const joined = isParticipating(drive.id)
                    return (
                        <div key={i} style={{ ...card, padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '24px', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <div style={{ padding: '8px 12px', borderRadius: '100px', background: '#f0fdf4', color: '#166534', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                                        {drive.type}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>
                                        <Zap size={14} fill="#f59e0b" /> {drive.points} pts
                                    </div>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>{drive.title}</h3>
                                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '20px' }}>{drive.description}</p>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#4b5563' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={16} color="#9ca3af" />
                                        <span>{new Date(drive.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={16} color="#9ca3af" />
                                        <span>{drive.location}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ padding: '16px 24px', background: joined ? '#f0fdf4' : '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {joined ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontSize: '14px', fontWeight: 600 }}>
                                        <CheckCircle size={18} /> Participating
                                    </div>
                                ) : (
                                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                                        Scan QR at drive to participate
                                    </div>
                                )}
                                <button disabled={joined} style={{ 
                                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, 
                                    border: 'none', background: joined ? 'transparent' : 'white', 
                                    color: joined ? '#166534' : '#6d28d9', cursor: joined ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}>
                                    View Hub <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Impact Highlights */}
            <div style={{ ...card, padding: '24px', background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid #dcfce7' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Award size={32} />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#166534' }}>Drive Your Impact</h4>
                        <p style={{ fontSize: '14px', color: '#15803d', marginTop: '4px' }}>Participation in eco drives builds your green certificate on campus. Join 200+ students this semester!</p>
                    </div>
                </div>
            </div>

            {/* QR Mock Scanner Modal */}
            <Modal isOpen={showScanner} onClose={() => { setShowScanner(false); setScannedDrive(null); }} title="Scan Campus Drive QR" size="sm">
                {!scannedDrive ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '20px 0' }}>
                        <div style={{ 
                            width: '240px', height: '240px', border: '3px solid #7c3aed', borderRadius: '24px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
                        }}>
                            {scanning ? (
                                <div style={{ textAlign: 'center' }}>
                                    <Loader2 size={48} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
                                    <p style={{ fontSize: '14px', color: '#7c3aed', marginTop: '12px', fontWeight: 600 }}>Analyzing QR...</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ width: '180px', height: '180px', background: '#f3f4f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Smartphone size={64} color="#d1d5db" />
                                    </div>
                                    <div style={{ position: 'absolute', top: '0', width: '100%', height: '2px', background: 'rgba(124,58,237,0.5)', boxShadow: '0 0 15px rgba(124,58,237,0.8)', animation: 'scan 2s linear infinite' }} />
                                </>
                            )}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h4 style={{ fontWeight: 700, color: '#1f2937' }}>Point at Eco Center QR</h4>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', maxWidth: '240px' }}>Scanning QR codes at event locations verifies your participation.</p>
                        </div>
                        <form onSubmit={handleCodeSubmit} style={{ display: 'flex', width: '100%', maxWidth: '280px', gap: '8px' }}>
                            <input 
                                type="text" placeholder="Enter drive code..." 
                                value={manualCode} onChange={e => setManualCode(e.target.value)}
                                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }} 
                            />
                            <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: '#7c3aed', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                                Verify
                            </button>
                        </form>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                            {drives.map(d => (
                                <button key={d.id} type="button" onClick={() => handleScan(d.id)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', color: '#9ca3af', fontSize: '10px', cursor: 'pointer' }}>
                                    Mock Scan: {d.title}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '16px', border: '2px solid #10b981', textAlign: 'center' }}>
                            <div style={{ width: '48px', height: '48px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                <Check size={28} />
                            </div>
                            <h3 style={{ fontWeight: 700, color: '#166534' }}>Drive Verified!</h3>
                            <p style={{ fontSize: '13px', color: '#15803d', marginTop: '4px' }}>Ready to join the <strong>{scannedDrive.title}</strong>?</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                                <span style={{ color: '#9ca3af', fontSize: '13px' }}>Location</span>
                                <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '13px' }}>{scannedDrive.location}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                                <span style={{ color: '#9ca3af', fontSize: '13px' }}>Points Reward</span>
                                <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>+{scannedDrive.points} EcoPoints</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={confirmJoin} style={{ 
                                flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' 
                            }}>Register & Mark Present</button>
                            <button onClick={() => setScannedDrive(null)} style={{ 
                                padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', cursor: 'pointer' 
                            }}><X size={20} /></button>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
