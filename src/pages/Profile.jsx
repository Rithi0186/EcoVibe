import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/db'
import {
    User, Award, Leaf, Calendar, BookOpen, Activity,
    TrendingDown, Flame, Star
} from 'lucide-react'

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}

export default function Profile() {
    const { user, profile, updateProfile } = useAuth()
    const [stats, setStats] = useState({ totalLogs: 0, lifetimeCO2: 0, totalPosts: 0, badgeCount: 0 })
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({ name: '', department: '', year: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => { 
        if (user) loadStats() 
        if (profile) setEditForm({ name: profile.name || '', department: profile.department || '', year: profile.year || '' })
    }, [user, profile])

    async function loadStats() {
        try {
            const logs = await db.query('co2_logs', { user_id: user.id })
            const posts = await db.query('posts', { user_id: user.id })
            const badges = await db.query('user_badges', { user_id: user.id })
            setStats({
                totalLogs: logs.length,
                lifetimeCO2: logs.reduce((s, l) => s + Number(l.co2_kg || 0), 0),
                totalPosts: posts.length,
                badgeCount: badges.length,
            })
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    async function handleUpdateProfile(e) {
        e.preventDefault()
        setSaving(true)
        try {
            await updateProfile({
                name: editForm.name,
                department: editForm.department,
                year: editForm.year
            })
            setIsEditing(false)
        } catch (err) {
            console.error('Update failed:', err)
        } finally {
            setSaving(false)
        }
    }

    const statItems = [
        { icon: Star, color: '#f59e0b', val: profile?.eco_points || 0, label: 'EcoPoints' },
        { icon: Flame, color: '#f97316', val: profile?.streak || 0, label: 'Day Streak' },
        { icon: TrendingDown, color: '#4caf50', val: stats.lifetimeCO2.toFixed(1), label: 'Total CO2 (kg)' },
        { icon: Award, color: '#8b5cf6', val: stats.badgeCount, label: 'Badges' },
    ]

    const activityRows = [
        { icon: Leaf, color: '#4caf50', label: 'CO2 Entries Logged', val: stats.totalLogs },
        { icon: BookOpen, color: '#3b82f6', label: 'Feed Posts Created', val: stats.totalPosts },
        { icon: User, color: '#8b5cf6', label: 'Roll Number', val: profile?.student_id || 'Not specified' },
        { icon: Calendar, color: '#3b82f6', label: 'Member Since', val: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>My Profile</h1>

            {/* Profile Card */}
            <div style={{ ...card, padding: '32px', textAlign: 'center', position: 'relative' }}>
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#4b5563', cursor: 'pointer' }}
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => setIsEditing(false)}
                            style={{ background: 'white', border: '1px solid #e5e7eb', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleUpdateProfile}
                            disabled={saving}
                            style={{ background: '#4caf50', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}

                <div style={{
                    width: '100px', height: '100px', margin: '0 auto 20px',
                    background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 12px 30px rgba(76,175,80,0.4)',
                    border: '4px solid white',
                    fontSize: '40px', color: 'white', fontWeight: 700
                }}>
                    {profile?.name?.charAt(0) || <User size={48} color="white" />}
                </div>

                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '320px', margin: '0 auto' }}>
                        <input 
                            style={{ padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', textAlign: 'center', fontSize: '16px', fontWeight: 700 }}
                            placeholder="Your Name"
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                                style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db', textAlign: 'center', fontSize: '14px' }}
                                placeholder="Department"
                                value={editForm.department}
                                onChange={e => setEditForm({...editForm, department: e.target.value})}
                            />
                            <select 
                                style={{ flex: 0.5, padding: '10px', borderRadius: '10px', border: '1px solid #d1d5db', textAlign: 'center', fontSize: '14px' }}
                                value={editForm.year}
                                onChange={e => setEditForm({...editForm, year: e.target.value})}
                            >
                                <option value="">Year</option>
                                <option value="1">1st</option>
                                <option value="2">2nd</option>
                                <option value="3">3rd</option>
                                <option value="4">4th</option>
                            </select>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Poppins, sans-serif', marginBottom: '4px' }}>{profile?.name}</h2>
                        <p style={{ color: '#4b5563', fontSize: '15px', fontWeight: 500, marginBottom: '4px' }}>{profile?.contact_email}</p>
                        <p style={{ color: '#9ca3af', fontSize: '13px', letterSpacing: '0.5px' }}>ID: {profile?.student_id || 'N/A'}</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                            <span style={{ padding: '6px 16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '100px', fontSize: '13px', fontWeight: 600, border: '1px solid #a5d6a7' }}>
                                {profile?.department || 'Set Department'}
                            </span>
                            <span style={{ padding: '6px 16px', background: '#dbeafe', color: '#1d4ed8', borderRadius: '100px', fontSize: '13px', fontWeight: 600, border: '1px solid #93c5fd' }}>
                                {profile?.year ? `Year ${profile.year}` : 'Set Year'}
                            </span>
                            {profile?.role === 'admin' && (
                                <span style={{ padding: '6px 16px', background: '#f3e8ff', color: '#7c3aed', borderRadius: '100px', fontSize: '13px', fontWeight: 600, border: '1px solid #c4b5fd' }}>
                                    Platform Admin
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {statItems.map((s, i) => (
                    <div key={i} style={{ ...card, padding: '20px', textAlign: 'center' }}>
                        <s.icon size={24} color={s.color} style={{ margin: '0 auto 10px' }} />
                        <p style={{ fontSize: '24px', fontWeight: 800 }}>{s.val}</p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Activity Summary */}
            <div style={{ ...card, padding: '24px' }}>
                <h3 style={{ fontWeight: 700, color: '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px' }}>
                    <Activity size={20} color="#4caf50" /> Student Records
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activityRows.map((row, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 18px', background: 'rgba(255,255,255,0.5)', 
                            borderRadius: '14px', border: '1px solid rgba(0,0,0,0.03)'
                        }}>
                            <span style={{ fontSize: '14px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <row.icon size={16} color={row.color} /> {row.label}
                            </span>
                            <span style={{ fontWeight: 700, color: '#374151', fontSize: '14px' }}>{row.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Eco Impact */}
            <div style={{
                ...card, padding: '24px',
                background: 'linear-gradient(135deg, #e8f5e9, #ecfdf5)'
            }}>
                <h3 style={{ fontWeight: 600, color: '#2e7d32', marginBottom: '12px' }}>🌍 Your Eco Impact</h3>
                <p style={{ fontSize: '14px', color: '#43a047', lineHeight: 1.7 }}>
                    You've logged <strong>{stats.totalLogs}</strong> activities, earned{' '}
                    <strong>{profile?.eco_points || 0} EcoPoints</strong>, and tracked{' '}
                    <strong>{stats.lifetimeCO2.toFixed(1)} kg</strong> of CO2. Keep going — every action makes a difference!
                </p>
            </div>
        </div>
    )
}
