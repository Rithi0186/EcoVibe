import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Leaf, LogOut, Award } from 'lucide-react'

export default function Navbar() {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()

    async function handleSignOut() {
        try {
            await signOut()
            navigate('/login')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: '64px',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(200,230,201,0.4)',
            boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '36px', height: '36px',
                    background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(76,175,80,0.3)'
                }}>
                    <Leaf size={20} color="white" />
                </div>
                <span style={{
                    fontSize: '20px', fontWeight: 800, fontFamily: 'Poppins, sans-serif',
                    background: 'linear-gradient(to right, #388e3c, #2e7d32)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>EcoVibe</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {profile && (
                    <>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#e8f5e9', padding: '6px 14px',
                            borderRadius: '100px', fontSize: '13px', fontWeight: 600, color: '#2e7d32'
                        }}>
                            <Award size={14} />
                            {profile.eco_points || 0} pts
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 700, fontSize: '13px'
                            }}>
                                {profile.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                {profile.name}
                            </span>
                        </div>
                        <button onClick={handleSignOut} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#9ca3af', display: 'flex', alignItems: 'center', padding: '6px'
                        }} title="Sign out">
                            <LogOut size={18} />
                        </button>
                    </>
                )}
            </div>
        </nav>
    )
}
