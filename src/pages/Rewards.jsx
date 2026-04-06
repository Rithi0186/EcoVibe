import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { StatSkeleton } from '../components/LoadingSkeleton'
import { QRCodeSVG } from 'qrcode.react'
import Modal from '../components/Modal'
import {
    Gift, Star, Coffee, Ticket, TreePine, ShoppingBag, Loader2,
    History, CheckCircle, PenTool, QrCode, Check
} from 'lucide-react'
import { insforge } from '../lib/insforge'

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}

export default function Rewards() {
    const { user, profile, updateProfile } = useAuth()
    const toast = useToast()
    const [rewards, setRewards] = useState([])
    const [redemptions, setRedemptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [redeeming, setRedeeming] = useState(null)
    const [showCode, setShowCode] = useState(null)
    const [activeTab, setActiveTab] = useState('rewards')

    useEffect(() => { loadData() }, [])

    async function loadData() {
        try {
            // 1. Fetch all rewards
            const allRewards = await db.getAll('rewards')
            const activeRewards = (allRewards || []).filter(r => r.active)
                .sort((a, b) => (a.points_cost || 0) - (b.points_cost || 0))
            setRewards(activeRewards)

            // 2. Fetch redemptions and link metadata in-memory
            const reds = await db.query('redemptions', { user_id: user.id })
            const enriched = (reds || [])
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map(r => {
                    const rData = (allRewards || []).find(rew => rew.id === r.reward_id)
                    return { ...r, rewards: rData }
                })
            
            setRedemptions(enriched)
        } catch (err) { console.error('Rewards load error:', err) }
        finally { setLoading(false) }
    }

    async function redeemReward(reward) {
        if ((profile?.eco_points || 0) < reward.points_cost) {
            toast.warning(`Insufficient EcoPoints! You need ${reward.points_cost - (profile?.eco_points || 0)} more.`)
            return
        }
        
        const confirmRedeem = window.confirm(`Spend ${reward.points_cost} points on ${reward.title}?`)
        if (!confirmRedeem) return

        setRedeeming(reward.id)
        try {
            const code = `EV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
            
            // 1. Log the redemption
            await db.insert('redemptions', {
                reward_id: reward.id, 
                user_id: user.id, 
                points_spent: reward.points_cost, 
                code, 
                status: 'active',
            })
            
            // 2. Subtract points from profile
            const currentPoints = profile?.eco_points || 0
            await updateProfile({ eco_points: currentPoints - reward.points_cost })
            
            // 3. Show the QR Code immediately
            setShowCode({ reward, code })
            toast.success(`Enjoy your "${reward.title}"!`)
            
            // 4. Refresh data
            await loadData()
        } catch (err) { 
            console.error('Redeem error:', err)
            toast.error(err.message || 'Failed to process redemption') 
        }
        finally { setRedeeming(null) }
    }

    function getIcon(iconName) {
        if (!iconName) return Gift
        // Map common reward icon names to components
        const iconMap = {
            'coffee': Coffee,
            'gift': Gift,
            'shopping-bag': ShoppingBag,
            'ticket': Ticket,
            'tree': TreePine,
            'star': Star,
            'activity': Gift,
            'pen-tool': PenTool
        }
        return iconMap[iconName] || Gift
    }

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {Array(6).fill(0).map((_, i) => <StatSkeleton key={i} />)}
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>My Rewards Hub</h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px' }}>Redeem your hard-earned EcoPoints for campus perks</p>
                </div>
                <div style={{ ...card, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #fcd34d', background: '#fffbeb' }}>
                    <Star size={24} color="#f59e0b" fill="#f59e0b" />
                    <div>
                        <p style={{ fontSize: '11px', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance</p>
                        <p style={{ fontWeight: 800, fontSize: '24px', color: '#1f2937', lineHeight: 1 }}>{profile?.eco_points || 0}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', padding: '6px', borderRadius: '14px', width: 'fit-content' }}>
                {[
                    { id: 'rewards', label: 'Store', icon: ShoppingBag },
                    { id: 'history', label: 'My Coupons', icon: History }
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '8px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                            border: 'none', cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: activeTab === tab.id ? 'white' : 'transparent',
                            color: activeTab === tab.id ? '#4caf50' : '#9ca3af',
                            boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'rewards' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {rewards.map(reward => {
                        const Icon = getIcon(reward.icon)
                        const canAfford = (profile?.eco_points || 0) >= reward.points_cost
                        return (
                            <div key={reward.id} style={{ ...card, padding: '24px', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '56px', height: '56px', minWidth: '56px', borderRadius: '18px',
                                        background: 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 8px 20px rgba(245,158,11,0.2)'
                                    }}>
                                        <Icon size={28} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 800, color: '#1f2937', fontSize: '16px' }}>{reward.title}</h3>
                                        <span style={{ fontSize: '12px', color: '#43a047', fontWeight: 600 }}>{reward.vendor}</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px', flex: 1 }}>{reward.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Star size={16} color="#f59e0b" fill="#f59e0b" />
                                        <span style={{ fontWeight: 800, fontSize: '18px', color: '#1f2937' }}>{reward.points_cost}</span>
                                    </div>
                                    <button 
                                        onClick={() => redeemReward(reward)} 
                                        disabled={!canAfford || redeeming === reward.id} 
                                        className="eco-btn" 
                                        style={{
                                            padding: '8px 24px', borderRadius: '12px', fontSize: '14px',
                                            opacity: canAfford ? 1 : 0.5,
                                            cursor: canAfford ? 'pointer' : 'not-allowed',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}
                                    >
                                        {redeeming === reward.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Redeem Now'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {redemptions.length > 0 ? (
                        redemptions.map(r => (
                            <div key={r.id} style={{ ...card, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '14px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Ticket size={24} color="#10b981" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: '16px', color: '#1f2937' }}>{r.rewards?.title || 'Coupon'}</p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                        Redeemed {new Date(r.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowCode({ reward: r.rewards, code: r.code })}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                                        border: '1px solid #10b981', background: 'white', color: '#10b981',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <QrCode size={16} /> QR Code
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
                            <History size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                            <p style={{ fontWeight: 500 }}>No redemptions found.</p>
                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Visit the store to spend your EcoPoints.</p>
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={!!showCode} onClose={() => setShowCode(null)} title="Redeem My Reward" size="sm">
                {showCode && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{ 
                            background: '#fffbeb', border: '1px solid #fcd34d', 
                            padding: '16px', borderRadius: '16px', marginBottom: '24px' 
                        }}>
                             <h4 style={{ fontWeight: 800, color: '#92400e', marginBottom: '4px' }}>{showCode.reward?.title}</h4>
                             <p style={{ fontSize: '13px', color: '#b45309' }}>Authorized Vendor: <strong>{showCode.reward?.vendor}</strong></p>
                        </div>

                        <div style={{ 
                            padding: '20px', background: 'white', borderRadius: '24px', 
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
                            display: 'inline-block', marginBottom: '24px'
                        }}>
                            <QRCodeSVG value={showCode.code} size={200} level="H" />
                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e5e7eb' }}>
                                <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px' }}>Validation Code</p>
                                <p style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 700, color: '#1f2937' }}>{showCode.code}</p>
                            </div>
                        </div>

                        <div style={{ 
                            padding: '16px', background: '#f0fdf4', borderRadius: '16px', 
                            fontSize: '13px', color: '#166534', textAlign: 'left',
                            display: 'flex', gap: '12px'
                        }}>
                            <div style={{ width: '24px', height: '24px', background: '#10b981', minWidth: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Check size={14} />
                            </div>
                            <p><strong>Instructions:</strong> Show this QR code to the vendor staff. They will scan it to verify and provide your reward.</p>
                        </div>
                        
                        <button 
                            onClick={() => setShowCode(null)}
                            style={{ 
                                marginTop: '24px', width: '100%', padding: '14px', borderRadius: '12px',
                                background: '#f3f4f6', border: 'none', color: '#4b5563', fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            Done
                        </button>
                    </div>
                )}
            </Modal>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

