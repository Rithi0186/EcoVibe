import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { StatSkeleton } from '../components/LoadingSkeleton'
import { QRCodeSVG } from 'qrcode.react'
import Modal from '../components/Modal'
import {
    Gift, Star, Coffee, Ticket, TreePine, ShoppingBag, Loader2,
    History, CheckCircle, PenTool
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

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
            const allRewards = await db.getAll('rewards')
            const activeRewards = allRewards.filter(r => r.active)
                .sort((a, b) => (a.points_cost || 0) - (b.points_cost || 0))
            setRewards(activeRewards)

            const reds = await db.query('redemptions', { user_id: user.id })
            const enriched = await Promise.all(reds
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map(async r => ({ 
                    ...r, 
                    rewards: await db.getById('rewards', r.reward_id) 
                }))
            )
            setRedemptions(enriched)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    async function redeemReward(reward) {
        if ((profile?.eco_points || 0) < reward.points_cost) {
            toast.warning(`Not enough points! Need ${reward.points_cost - (profile?.eco_points || 0)} more.`)
            return
        }
        setRedeeming(reward.id)
        try {
            const code = `EV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
            await db.insert('redemptions', {
                reward_id: reward.id, 
                user_id: user.id, 
                points_spent: reward.points_cost, 
                code, 
                status: 'active',
            })
            await updateProfile({ eco_points: (profile?.eco_points || 0) - reward.points_cost })
            setShowCode({ reward, code })
            toast.success('Reward redeemed! 🎉')
            await loadData()
        } catch (err) { toast.error(err.message || 'Failed to redeem') }
        finally { setRedeeming(null) }
    }

    function getIcon(iconName) {
        const name = iconName?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
        return LucideIcons[name] || Gift
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Rewards</h1>
                    <p style={{ color: '#9ca3af', marginTop: '4px' }}>Redeem your EcoPoints for real rewards</p>
                </div>
                <div style={{ ...card, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={18} color="#f59e0b" />
                    <span style={{ fontWeight: 700, fontSize: '18px', color: '#1f2937' }}>{profile?.eco_points || 0}</span>
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>EcoPoints</span>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {['rewards', 'history'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
                        border: 'none', cursor: 'pointer',
                        background: activeTab === tab ? '#4caf50' : 'white',
                        color: activeTab === tab ? 'white' : '#6b7280',
                        boxShadow: activeTab === tab ? '0 4px 12px rgba(76,175,80,0.3)' : 'none'
                    }}>
                        {tab === 'rewards' ? <><Gift size={16} /> Available Rewards</> : <><History size={16} /> Redemption History</>}
                    </button>
                ))}
            </div>

            {activeTab === 'rewards' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {rewards.map(reward => {
                        const Icon = getIcon(reward.icon)
                        const canAfford = (profile?.eco_points || 0) >= reward.points_cost
                        return (
                            <div key={reward.id} style={{ ...card, padding: '20px', opacity: canAfford ? 1 : 0.6 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', minWidth: '48px', borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(251,191,36,0.3)'
                                    }}>
                                        <Icon size={22} color="white" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontWeight: 700, color: '#1f2937' }}>{reward.title}</h3>
                                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>{reward.vendor}</p>
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{reward.description}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={14} /> {reward.points_cost} pts
                                    </span>
                                    <button onClick={() => redeemReward(reward)} disabled={!canAfford || redeeming === reward.id} style={{
                                        padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500,
                                        border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
                                        background: canAfford ? '#4caf50' : '#f3f4f6',
                                        color: canAfford ? 'white' : '#9ca3af',
                                        boxShadow: canAfford ? '0 4px 12px rgba(76,175,80,0.3)' : 'none'
                                    }}>
                                        {redeeming === reward.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Redeem'}
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
                            <div key={r.id} style={{ ...card, padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px', background: '#c8e6c9', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Gift size={18} color="#43a047" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 500, fontSize: '14px' }}>{r.rewards?.title}</p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        {new Date(r.created_at).toLocaleDateString()} · {r.rewards?.vendor}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#d97706' }}>-{r.points_spent} pts</p>
                                    <button onClick={() => setShowCode({ reward: r.rewards, code: r.code })} style={{
                                        fontSize: '12px', color: '#43a047', fontWeight: 500,
                                        background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline'
                                    }}>View Code</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
                            <Gift size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p>No redemptions yet. Start redeeming rewards!</p>
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={!!showCode} onClose={() => setShowCode(null)} title="Redemption Code" size="sm">
                {showCode && (
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'inline-flex', padding: '16px', background: 'white', borderRadius: '16px', border: '2px solid #a5d6a7', margin: '0 auto' }}>
                            <QRCodeSVG value={showCode.code} size={180} />
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Redemption Code</p>
                            <p style={{ fontSize: '18px', fontFamily: 'monospace', fontWeight: 700, color: '#1f2937', background: '#f9fafb', borderRadius: '12px', padding: '8px 16px' }}>
                                {showCode.code}
                            </p>
                        </div>
                        <div style={{ padding: '12px', background: '#e8f5e9', borderRadius: '12px', fontSize: '14px', color: '#2e7d32' }}>
                            <p style={{ fontWeight: 500 }}>🎉 {showCode.reward?.title}</p>
                            <p style={{ fontSize: '12px', color: '#43a047', marginTop: '4px' }}>Show this code to the vendor to claim your reward</p>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
