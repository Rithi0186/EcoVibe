import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { StatSkeleton } from '../components/LoadingSkeleton'
import Modal from '../components/Modal'
import {
    Trophy, Flame, Award, CheckCircle, Star, Lock, Loader2,
    Calendar, Zap, Target, Upload, Clock, Camera, X, Image
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}

export default function Challenges() {
    const { user, profile, updateProfile } = useAuth()
    const toast = useToast()
    const [challenges, setChallenges] = useState([])
    const [completions, setCompletions] = useState([])
    const [badges, setBadges] = useState([])
    const [userBadges, setUserBadges] = useState([])
    const [loading, setLoading] = useState(true)
    const [completing, setCompleting] = useState(null)

    // Proof upload modal state
    const [proofModal, setProofModal] = useState(null) // holds the challenge object
    const [proofFile, setProofFile] = useState(null)
    const [proofPreview, setProofPreview] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { loadData() }, [user])

    async function loadData() {
        try {
            if (!user?.id) return
            const chsRaw = await db.query('challenges', { active: true })
            const comps = await db.query('challenge_completions', { user_id: user.id })
            const bgs = await db.getAll('badges')
            const ubs_raw = await db.query('user_badges', { user_id: user.id })
            
            const ubs = ubs_raw.map(ub => ({ 
                ...ub, 
                badges: bgs.find(b => b.id === ub.badge_id) 
            }))

            // Filtering logic for rotating challenges
            const todayDate = new Date()
            const todayStr = todayDate.toISOString().split('T')[0]
            const dayNum = todayDate.getDay() // 0=Sun, 6=Sat
            const isWeekend = dayNum === 0 || dayNum === 6
            
            const dailyPool = chsRaw.filter(c => c.frequency === 'daily')
            const weeklyPool = chsRaw.filter(c => c.frequency === 'weekly')

            // Using date as seed for stable daily rotation
            const dailySeed = todayStr.split('-').join('')
            const rotatingDaily = dailyPool.sort((a,b) => {
                const hash = (s) => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
                return hash(a.id + dailySeed) - hash(b.id + dailySeed)
            }).slice(0, 3)

            // Weekly rotation only on weekends
            let filteredChallenges = [...rotatingDaily]
            if (isWeekend) {
                const weeklySeed = todayStr.substring(0, 7) // same for the month segment to keep it somewhat stable
                const rotatingWeekly = weeklyPool.sort((a,b) => {
                    const hash = (s) => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
                    return hash(a.id + weeklySeed) - hash(b.id + weeklySeed)
                }).slice(0, 2)
                filteredChallenges = [...filteredChallenges, ...rotatingWeekly]
            }

            setChallenges(filteredChallenges)
            setCompletions(comps)
            setBadges(bgs)
            setUserBadges(ubs)

            await checkAndAwardBadges(bgs, ubs, comps)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    async function checkAndAwardBadges(allBadges, earnedBadges, userCompletions) {
        if (!user) return
        const earnedIds = new Set(earnedBadges.map(ub => ub.badge_id))
        const approvedCompletions = userCompletions.filter(c => c.status === 'approved')

        for (const badge of allBadges) {
            if (earnedIds.has(badge.id)) continue

            let met = false
            switch (badge.requirement) {
                case 'first_log':
                    const logCount = await db.count('co2_logs', { user_id: user.id })
                    met = logCount >= 1
                    break
                case '10_challenges':
                    met = approvedCompletions.length >= 10
                    break
                case 'first_swap':
                    const swapCount = await db.count('swap_requests', { buyer_id: user.id, status: 'accepted' })
                    met = swapCount >= 1
                    break
                case '5_posts':
                    const postCount = await db.count('posts', { user_id: user.id })
                    met = postCount >= 5
                    break
                case '500_points':
                    met = (profile?.eco_points || 0) >= 500
                    break
                case '7_streak':
                    met = (profile?.streak || 0) >= 7
                    break
                case 'tree_reward':
                    const redemptionCount = await db.count('redemptions', { user_id: user.id })
                    met = redemptionCount >= 1
                    break
            }

            if (met) {
                try {
                    await db.insert('user_badges', { user_id: user.id, badge_id: badge.id })
                    toast.success(`🏆 Badge Unlocked: ${badge.name}!`)
                    const updatedUbsRaw = await db.query('user_badges', { user_id: user.id })
                    const updatedUbs = updatedUbsRaw.map(ub => ({ 
                        ...ub, 
                        badges: allBadges.find(b => b.id === ub.badge_id) 
                    }))
                    setUserBadges(updatedUbs)
                } catch (e) {
                    // Ignore if already exists
                }
            }
        }
    }

    function getCompletionStatus(challengeId) {
        const today = new Date().toISOString().split('T')[0]
        const completion = completions.find(c =>
            c.challenge_id === challengeId && c.completed_at?.split('T')[0] === today
        )
        if (!completion) return null
        return completion.status || 'approved'
    }

    function isCompletedToday(challengeId) {
        const today = new Date().toISOString().split('T')[0]
        return completions.some(c => c.challenge_id === challengeId && c.completed_at?.split('T')[0] === today)
    }

    function isCompletedThisWeek(challengeId) {
        const weekStart = new Date(Date.now() - 7 * 86400000)
        return completions.some(c => c.challenge_id === challengeId && new Date(c.completed_at) >= weekStart)
    }

    function getWeeklyStatus(challengeId) {
        const weekStart = new Date(Date.now() - 7 * 86400000)
        const completion = completions.find(c =>
            c.challenge_id === challengeId && new Date(c.completed_at) >= weekStart
        )
        if (!completion) return null
        return completion.status || 'approved'
    }

    function openProofModal(challenge) {
        const isDaily = challenge.frequency === 'daily'
        if (isDaily && isCompletedToday(challenge.id)) { toast.info('Already submitted today!'); return }
        if (!isDaily && isCompletedThisWeek(challenge.id)) { toast.info('Already submitted this week!'); return }
        setProofModal(challenge)
        setProofFile(null)
        setProofPreview(null)
    }

    function handleFileSelect(e) {
        const file = e.target.files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.warning('Please upload an image file')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.warning('Image must be under 5MB')
            return
        }
        setProofFile(file)
        const reader = new FileReader()
        reader.onload = (ev) => setProofPreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    async function submitProof() {
        if (!proofFile || !proofModal) {
            toast.warning('Please upload a photo as proof')
            return
        }
        setSubmitting(true)
        try {
            const fileName = `${user.id}/${Date.now()}-${proofFile.name.replace(/\s+/g, '_')}`
            const data = await db.upload('challenge_proofs', fileName, proofFile)
            const proofUrl = data.url

            await db.insert('challenge_completions', {
                challenge_id: proofModal.id,
                user_id: user.id,
                proof_url: proofUrl,
                status: 'pending',
                completed_at: new Date().toISOString(),
            })

            toast.success('Proof submitted! ⏳ Waiting for admin approval.')
            setProofModal(null)
            setProofFile(null)
            setProofPreview(null)
            await loadData()
        } catch (err) {
            toast.error(err.message || 'Failed to submit')
        } finally {
            setSubmitting(false)
        }
    }

    function getIcon(iconName) {
        if (!iconName) return Star
        const camelName = iconName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')
        return LucideIcons[camelName] || Star
    }

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {Array(6).fill(0).map((_, i) => <StatSkeleton key={i} />)}
            </div>
        )
    }

    const todayDaily = challenges.filter(c => c.frequency === 'daily')
    const weekendWeekly = challenges.filter(c => c.frequency === 'weekly')

    const approvedCount = completions.filter(c => c.status === 'approved' || !c.status).length
    const pendingCount = completions.filter(c => c.status === 'pending').length

    const statCards = [
        { icon: Trophy, color: '#f59e0b', val: approvedCount, label: 'Approved' },
        { icon: Clock, color: '#f97316', val: pendingCount, label: 'Pending' },
        { icon: Flame, color: '#ef4444', val: profile?.streak || 0, label: 'Day Streak' },
        { icon: Award, color: '#8b5cf6', val: userBadges.length, label: 'Badges' },
    ]

    function renderStatusBadge(status) {
        if (status === 'pending') {
            return (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', fontWeight: 600, color: '#d97706',
                    background: '#fffbeb', padding: '3px 8px', borderRadius: '6px',
                    border: '1px solid #fde68a'
                }}>
                    <Clock size={10} /> Pending
                </span>
            )
        }
        if (status === 'rejected') {
            return (
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', fontWeight: 600, color: '#dc2626',
                    background: '#fef2f2', padding: '3px 8px', borderRadius: '6px',
                    border: '1px solid #fecaca'
                }}>
                    <X size={10} /> Rejected
                </span>
            )
        }
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', fontWeight: 600, color: '#16a34a',
                background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px',
                border: '1px solid #bbf7d0'
            }}>
                <CheckCircle size={10} /> Done
            </span>
        )
    }

    function renderChallenge(ch, isDaily) {
        const status = isDaily ? getCompletionStatus(ch.id) : getWeeklyStatus(ch.id)
        const submitted = !!status
        const Icon = getIcon(ch.icon)
        const accent = isDaily
            ? { bg: '#e8f5e9', border: '#a5d6a7', text: '#43a047', gradFrom: '#66bb6a', gradTo: '#2e7d32', btnBg: '#4caf50' }
            : { bg: '#f3e8ff', border: '#c4b5fd', text: '#7c3aed', gradFrom: '#a78bfa', gradTo: '#7c3aed', btnBg: '#8b5cf6' }

        return (
            <div key={ch.id} style={{
                ...card, padding: '16px', display: 'flex', alignItems: 'center', gap: '16px',
                background: submitted ? `${accent.bg}80` : card.background,
                borderColor: submitted ? accent.border : undefined
            }}>
                <div style={{
                    width: '44px', height: '44px', minWidth: '44px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: submitted ? accent.bg : `linear-gradient(135deg, ${accent.gradFrom}, ${accent.gradTo})`,
                    color: submitted ? accent.text : 'white'
                }}>
                    {status === 'approved' ? <CheckCircle size={20} /> : submitted ? <Clock size={20} /> : <Icon size={20} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>{ch.title}</h3>
                    <p style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.description}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: accent.text, marginBottom: '4px' }}>+{ch.points} pts</p>
                    {submitted ? (
                        renderStatusBadge(status)
                    ) : (
                        <button onClick={() => openProofModal(ch)} style={{
                            padding: '6px 14px', background: accent.btnBg, color: 'white',
                            borderRadius: '8px', fontSize: '12px', fontWeight: 500,
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            <Camera size={12} /> Complete
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Challenges</h1>
                <p style={{ color: '#9ca3af', marginTop: '4px' }}>Complete eco-challenges, upload proof, and earn rewards</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="stats-grid">
                {statCards.map((s, i) => (
                    <div key={i} style={{ ...card, padding: '16px', textAlign: 'center' }}>
                        <s.icon size={22} color={s.color} style={{ margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '20px', fontWeight: 700 }}>{s.val}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Info Banner */}
            <div style={{
                ...card, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '1px solid #fde68a'
            }}>
                <Camera size={20} color="#d97706" />
                <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}>Proof Required</p>
                    <p style={{ fontSize: '12px', color: '#b45309' }}>Upload a photo when completing challenges. Points are awarded after admin approval.</p>
                </div>
            </div>

            {/* Daily */}
            <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Calendar size={18} color="#4caf50" /> Daily Challenges
                    <span style={{ fontSize: '12px', fontWeight: 400, color: '#9ca3af', marginLeft: 'auto' }}>Refreshing in {24 - new Date().getHours()}h</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {todayDaily.length > 0 ? (
                        todayDaily.map(ch => renderChallenge(ch, true))
                    ) : (
                        <div style={{ ...card, padding: '32px', textAlign: 'center', background: 'rgba(255,255,255,0.4)' }}>
                            <Star size={32} color="#9ca3af" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                            <p style={{ color: '#9ca3af' }}>No daily challenges available for today.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly */}
            {weekendWeekly.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Target size={18} color="#8b5cf6" /> Weekend Specials (Weekly)
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#8b5cf6', background: '#f3e8ff', padding: '2px 8px', borderRadius: '12px', marginLeft: 'auto' }}>ACTIVE</span>
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {weekendWeekly.map(ch => renderChallenge(ch, false))}
                    </div>
                </div>
            )}

            {/* Badges */}
            <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Award size={18} color="#f59e0b" /> Badges
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {badges.map(badge => {
                        const earned = userBadges.some(ub => ub.badge_id === badge.id)
                        return (
                            <div key={badge.id} style={{
                                ...card, padding: '16px', textAlign: 'center', opacity: earned ? 1 : 0.5,
                                borderColor: earned ? '#fcd34d' : undefined
                            }}>
                                <div style={{
                                    width: '56px', height: '56px', margin: '0 auto 8px',
                                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: earned ? 'linear-gradient(135deg, #fbbf24, #d97706)' : '#f3f4f6',
                                    boxShadow: earned ? '0 4px 12px rgba(251,191,36,0.4)' : 'none'
                                }}>
                                    {earned ? <LucideIcons.Award size={24} color="white" /> : <LucideIcons.Lock size={20} color="#9ca3af" />}
                                </div>
                                <p style={{ fontSize: '14px', fontWeight: 600 }}>{badge.name}</p>
                                <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>{badge.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Proof Upload Modal */}
            <Modal isOpen={!!proofModal} onClose={() => { setProofModal(null); setProofFile(null); setProofPreview(null) }} title="Upload Proof" size="sm">
                {proofModal && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Challenge info */}
                        <div style={{
                            padding: '16px', background: '#f0fdf4', borderRadius: '12px',
                            border: '1px solid #bbf7d0'
                        }}>
                            <h3 style={{ fontWeight: 600, fontSize: '16px', color: '#166534' }}>{proofModal.title}</h3>
                            <p style={{ fontSize: '13px', color: '#15803d', marginTop: '4px' }}>{proofModal.description}</p>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a', marginTop: '8px' }}>+{proofModal.points} EcoPoints</p>
                        </div>

                        {/* Upload area */}
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>📸 Upload photo proof</p>
                            {proofPreview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={proofPreview} alt="Proof" style={{
                                        width: '100%', height: '200px', objectFit: 'cover',
                                        borderRadius: '12px', border: '2px solid #a5d6a7'
                                    }} />
                                    <button onClick={() => { setProofFile(null); setProofPreview(null) }} style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: 'rgba(0,0,0,0.6)', color: 'white',
                                        border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <X size={14} />
                                    </button>
                                    <p style={{ fontSize: '12px', color: '#4caf50', marginTop: '8px', fontWeight: 500 }}>
                                        ✅ {proofFile.name}
                                    </p>
                                </div>
                            ) : (
                                <label style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    gap: '12px', padding: '32px', borderRadius: '12px',
                                    border: '2px dashed #a5d6a7', background: '#f0fdf4',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(76,175,80,0.3)'
                                    }}>
                                        <Camera size={24} color="white" />
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#2e7d32' }}>Click to upload photo</p>
                                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>JPG, PNG up to 5MB</p>
                                    </div>
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
                                </label>
                            )}
                        </div>

                        {/* Info note */}
                        <div style={{
                            padding: '12px', background: '#fffbeb', borderRadius: '10px',
                            border: '1px solid #fde68a', display: 'flex', gap: '8px', alignItems: 'flex-start'
                        }}>
                            <Clock size={14} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                                After submitting, your proof will be reviewed by an admin. EcoPoints will be awarded once approved.
                            </p>
                        </div>

                        {/* Submit button */}
                        <button onClick={submitProof} disabled={submitting || !proofFile} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 600,
                            border: 'none', width: '100%',
                            cursor: proofFile ? 'pointer' : 'not-allowed',
                            background: proofFile ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : '#e5e7eb',
                            color: proofFile ? 'white' : '#9ca3af',
                            boxShadow: proofFile ? '0 4px 12px rgba(76,175,80,0.3)' : 'none'
                        }}>
                            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={18} />}
                            {submitting ? 'Submitting...' : 'Submit Proof'}
                        </button>
                    </div>
                )}
            </Modal>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 640px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </div>
    )
}
