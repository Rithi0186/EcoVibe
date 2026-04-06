import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/db'
import { generateEcoTips } from '../lib/ecoTips'
import { StatSkeleton, ChartSkeleton } from '../components/LoadingSkeleton'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts'
import {
    Leaf, Flame, TrendingDown, Trophy, Activity,
    Footprints, Utensils, Zap, Trash2, Lightbulb,
    ShoppingBag, MessageSquare, AlertTriangle
} from 'lucide-react'

const COLORS = ['#4CAF50', '#66BB6A', '#81C784', '#A5D6A7']
const CAT_ICONS = { transport: Footprints, food: Utensils, electricity: Zap, waste: Trash2 }

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}

export default function Dashboard() {
    const { user, profile } = useAuth()
    const [stats, setStats] = useState(null)
    const [categoryData, setCategoryData] = useState([])
    const [weeklyData, setWeeklyData] = useState([])
    const [recentActivity, setRecentActivity] = useState([])
    const [leaderboard, setLeaderboard] = useState([])
    const [rank, setRank] = useState(0)
    const [tips, setTips] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { if (user) loadDashboard() }, [user])

    async function loadDashboard() {
        try {
            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString()

            const allLogs = await db.query('co2_logs', { user_id: user.id })
            const monthLogs = allLogs.filter(l => l.created_at >= monthStart)

            const monthlyCO2 = monthLogs.reduce((s, l) => s + Number(l.co2_kg || 0), 0)
            const lifetimeCO2 = allLogs.reduce((s, l) => s + Number(l.co2_kg || 0), 0)
            const weekLogs = allLogs.filter(l => new Date(l.created_at) >= new Date(weekStart))
            const weeklyCO2 = weekLogs.reduce((s, l) => s + Number(l.co2_kg || 0), 0)

            const catMap = {}
            monthLogs.forEach(l => { catMap[l.category] = (catMap[l.category] || 0) + Number(l.co2_kg || 0) })
            setCategoryData(Object.entries(catMap).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1), value: parseFloat(value.toFixed(2))
            })))

            const dayMap = {}
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 86400000)
                dayMap[d.toLocaleDateString('en', { weekday: 'short' })] = 0
            }
            weekLogs.forEach(l => {
                const key = new Date(l.created_at).toLocaleDateString('en', { weekday: 'short' })
                if (dayMap[key] !== undefined) dayMap[key] += Number(l.co2_kg || 0)
            })
            setWeeklyData(Object.entries(dayMap).map(([day, co2]) => ({ day, co2: parseFloat(co2.toFixed(2)) })))

            const leaders = await db.getAll('profiles')
            const sortedLeaders = (leaders || [])
                .sort((a, b) => (b.eco_points || 0) - (a.eco_points || 0))
                .slice(0, 10)
            setLeaderboard(sortedLeaders)
            setRank(sortedLeaders.findIndex(l => l.id === user.id) + 1 || '—')

            // Fetch other activities
            const postsPromise = db.query('posts', { user_id: user.id }).catch(() => [])
            const reportsPromise = db.query('waste_reports', { user_id: user.id }).catch(() => [])
            const listingsPromise = db.query('marketplace_listings', { user_id: user.id }).catch(() => [])
            const [posts, reports, listings] = await Promise.all([postsPromise, reportsPromise, listingsPromise])

            const formattedLogs = allLogs.map(l => ({ ...l, act_type: 'co2_log', title: `${l.category} Activity`, subtitle: `${Number(l.co2_kg).toFixed(1)} kg CO2`, points: l.points_earned, Icon: CAT_ICONS[l.category] || Activity }))
            const formattedPosts = posts.map(p => ({ ...p, act_type: 'post', title: 'Community Post', subtitle: p.content.substring(0, 30) + (p.content.length > 30 ? '...' : ''), points: p.points_awarded || 0, Icon: MessageSquare }))
            const formattedReports = reports.map(r => ({ ...r, act_type: 'report', title: 'Submitted Report', subtitle: r.category || 'General', points: r.points_awarded || 0, Icon: AlertTriangle }))
            const formattedListings = listings.map(l => ({ ...l, act_type: 'listing', title: 'GreenSwap Item', subtitle: l.title, points: 0, Icon: ShoppingBag }))

            const recent = [...formattedLogs, ...formattedPosts, ...formattedReports, ...formattedListings]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
            setRecentActivity(recent)

            setStats({ monthlyCO2, lifetimeCO2, weeklyCO2 })
            setTips(generateEcoTips(allLogs.filter(l => new Date(l.created_at) >= new Date(now.getTime() - 7 * 86400000))))
        } catch (err) { console.error('Dashboard error:', err) }
        finally { setLoading(false) }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                    {Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    const monthlyTarget = 50
    const progressPct = stats ? Math.min(100, (stats.monthlyCO2 / monthlyTarget) * 100) : 0
    const pieData = [{ name: 'Used', value: progressPct }, { name: 'Remaining', value: 100 - progressPct }]

    const statItems = [
        { icon: Leaf, color: '#4caf50', label: 'Monthly CO2', val: `${stats?.monthlyCO2?.toFixed(1)} kg`, sub: `Target: ${monthlyTarget} kg` },
        { icon: Flame, color: '#f59e0b', label: 'Streak', val: `${profile?.streak || 0} days`, sub: 'Keep it going!' },
        { icon: TrendingDown, color: '#10b981', label: 'Weekly Savings', val: `${stats?.weeklyCO2?.toFixed(1)} kg`, sub: 'This week' },
        { icon: Trophy, color: '#8b5cf6', label: 'Campus Rank', val: `#${rank}`, sub: `${profile?.eco_points || 0} EcoPoints` },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                    Welcome back, <span style={{ color: '#43a047' }}>{profile?.name}</span> 👋
                </h1>
                <p style={{ color: '#9ca3af', marginTop: '4px' }}>Here's your sustainability snapshot</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                {statItems.map((s, i) => (
                    <div key={i} style={{ ...card, padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <s.icon size={16} color={s.color} />
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#9ca3af' }}>{s.label}</span>
                        </div>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937' }}>{s.val}</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{ ...card, padding: '24px' }}>
                    <h3 style={{ fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Monthly CO2 Progress</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={80}
                                        startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                                        <Cell fill={progressPct > 80 ? '#ef4444' : progressPct > 50 ? '#f59e0b' : '#4CAF50'} />
                                        <Cell fill="#e8f5e9" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center'
                            }}>
                                <p style={{ fontSize: '24px', fontWeight: 700 }}>{progressPct.toFixed(0)}%</p>
                                <p style={{ fontSize: '10px', color: '#9ca3af' }}>of target</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                        {stats?.monthlyCO2?.toFixed(1)} / {monthlyTarget} kg CO2 this month
                    </div>
                </div>

                <div style={{ ...card, padding: '24px' }}>
                    <h3 style={{ fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Category Breakdown</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={categoryData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={v => `${v} kg`} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
                            No data yet. Start tracking to see your breakdown!
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Trend */}
            <div style={{ ...card, padding: '24px' }}>
                <h3 style={{ fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Weekly CO2 Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={weeklyData}>
                        <defs>
                            <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={v => `${v} kg`} />
                        <Area type="monotone" dataKey="co2" stroke="#4CAF50" fill="url(#co2Grad)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Tips */}
                <div style={{ ...card, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Lightbulb size={18} color="#f59e0b" />
                        <h3 style={{ fontWeight: 600, color: '#374151' }}>Personalized Tips</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {tips.map((tip, i) => (
                            <div key={i} style={{
                                padding: '12px', background: 'rgba(232,245,233,0.5)',
                                borderRadius: '12px', fontSize: '14px', color: '#4b5563', lineHeight: 1.6
                            }}>{tip}</div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ ...card, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Activity size={18} color="#4caf50" />
                        <h3 style={{ fontWeight: 600, color: '#374151' }}>Recent Activity</h3>
                    </div>
                    {recentActivity.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentActivity.map(log => {
                                const Icon = log.Icon || Activity
                                return (
                                    <div key={log.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '8px', borderRadius: '8px'
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px', background: '#c8e6c9',
                                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Icon size={14} color="#43a047" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>{log.title}</p>
                                            <p style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(log.created_at).toLocaleDateString()} · {log.act_type === 'co2_log' ? '' : log.subtitle}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {log.act_type === 'co2_log' && <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{log.subtitle}</p>}
                                            {log.points > 0 && (
                                                <p style={{ fontSize: '12px', color: '#4caf50' }}>+{log.points} pts</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '32px 0' }}>No activity yet. Start tracking!</p>
                    )}
                </div>
            </div>

            {/* Leaderboard */}
            <div style={{ ...card, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Trophy size={18} color="#f59e0b" />
                    <h3 style={{ fontWeight: 600, color: '#374151' }}>Campus Leaderboard</h3>
                </div>
                {leaderboard.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {leaderboard.map((p, i) => {
                            const rankColors = [
                                { bg: '#fef3c7', fg: '#b45309' },
                                { bg: '#f3f4f6', fg: '#4b5563' },
                                { bg: '#ffedd5', fg: '#c2410c' },
                            ]
                            const rc = rankColors[i] || { bg: '#f9fafb', fg: '#6b7280' }
                            return (
                                <div key={p.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '12px', borderRadius: '12px',
                                    background: p.id === user?.id ? '#e8f5e9' : 'transparent',
                                    border: p.id === user?.id ? '1px solid #a5d6a7' : '1px solid transparent'
                                }}>
                                    <span style={{
                                        width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', borderRadius: '50%', fontSize: '14px', fontWeight: 700,
                                        background: rc.bg, color: rc.fg
                                    }}>{i + 1}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 500, fontSize: '14px' }}>{p.name}</p>
                                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>{p.student_id}</p>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#43a047' }}>{p.eco_points} pts</span>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>No rankings yet</p>
                )}
            </div>
        </div>
    )
}
