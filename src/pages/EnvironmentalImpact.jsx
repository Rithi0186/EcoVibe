import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/db'
import { REUSE_IMPACT, calculateImpactSaved } from '../lib/impactCalculator'
import { 
    Zap, Droplets, TreePine, BarChart3, Info, 
    Smartphone, Book, Shirt, ShoppingBag, Palette, 
    TrendingUp, Award, Globe, Leaf
} from 'lucide-react'

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}

export default function EnvironmentalImpact() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        user: { co2: 0, water: 0, trees: 0, count: 0 },
        community: { co2: 0, water: 0, trees: 0, count: 0 }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadImpact()
    }, [])

    async function loadImpact() {
        setLoading(true)
        try {
            // Get all sold items from GreenSwap
            const allSold = await db.query('marketplace_listings', { status: 'sold' })
            const userSold = allSold.filter(l => l.user_id === user.id)

            const calculateTotal = (listings) => {
                let co2 = 0, water = 0, trees = 0
                listings.forEach(l => {
                    const impact = calculateImpactSaved(l.category)
                    co2 += impact.co2
                    water += impact.water
                    trees += impact.trees
                })
                return { co2: parseFloat(co2.toFixed(1)), water, trees: parseFloat(trees.toFixed(2)), count: listings.length }
            }

            setStats({
                user: calculateTotal(userSold),
                community: calculateTotal(allSold)
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const IMPACT_CARDS = [
        { label: 'CO2 Saved', value: stats.user.co2, unit: 'kg', icon: Zap, color: '#f59e0b', desc: 'Emissions avoided by reusing instead of buying new' },
        { label: 'Water Saved', value: stats.user.water, unit: 'Liters', icon: Droplets, color: '#3b82f6', desc: 'Water consumption saved in production cycles' },
        { label: 'Tree Equiv.', value: stats.user.trees, unit: 'Trees', icon: TreePine, color: '#10b981', desc: 'Equivalent to the annual carbon absorption of trees' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Environmental Impact</h1>
                <p style={{ color: '#9ca3af', marginTop: '4px' }}>See the positive change you've made through circular economy</p>
            </div>

            {/* User Personal Impact */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {IMPACT_CARDS.map((item, i) => (
                    <div key={i} style={{ ...card, padding: '24px', borderLeft: `6px solid ${item.color}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', background: `${item.color}15` }}>
                                <item.icon size={24} color={item.color} />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>{item.label}</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontSize: '36px', fontWeight: 800, color: '#1f2937' }}>{item.value.toLocaleString()}</span>
                            <span style={{ fontSize: '16px', color: '#9ca3af', marginLeft: '6px' }}>{item.unit}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Community Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="impact-grid">
                <div style={{ ...card, padding: '24px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Community Collective Impact</h3>
                            <p style={{ fontSize: '13px', opacity: 0.9 }}>What we've achieved together on campus</p>
                        </div>
                        <Globe size={32} style={{ opacity: 0.3 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                        <div>
                            <p style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>Items Reused</p>
                            <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.community.count}+</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>CO2 Offset</p>
                            <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.community.co2.toLocaleString()} kg</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>Water Saved</p>
                            <p style={{ fontSize: '24px', fontWeight: 700 }}>{(stats.community.water / 1000).toFixed(1)}k L</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>Tree Growth</p>
                            <p style={{ fontSize: '24px', fontWeight: 700 }}>{stats.community.trees.toLocaleString()} yrs</p>
                        </div>
                    </div>
                </div>

                <div style={{ ...card, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <BarChart3 size={20} color="#10b981" />
                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Savings by Category</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(REUSE_IMPACT).slice(0, 5).map(([cat, val]) => (
                            <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ fontSize: '14px', color: '#4b5563' }}>{cat}</span>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{val.co2} kg CO2</span>
                                    <p style={{ fontSize: '11px', color: '#9ca3af' }}>per item reused</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Circular? Section */}
            <div style={{ ...card, padding: '24px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: '#10b981', color: 'white' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>Circular Economy on Campus</h3>
                        <p style={{ fontSize: '14px', color: '#15803d', lineHeight: 1.6 }}>By reusing textbooks, electronics, and clothing, students direct products back into the economy instead of landfills. This prevents the demand for new production, which is responsible for over 45% of global greenhouse gas emissions.</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .impact-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}
