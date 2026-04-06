import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { Leaf, LogIn, Loader2, Eye, EyeOff, Footprints, Star, Shield, ChevronRight, Users } from 'lucide-react'

const ADMIN_ID = 'Mcet'
const ADMIN_PW = '123456'

export default function Login() {
    const [mode, setMode] = useState('student') // 'student' or 'admin'
    const [studentId, setStudentId] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signIn, setAdminAuth } = useAuth()
    const toast = useToast()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        if (!studentId.trim() || !password) {
            toast.warning('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            if (mode === 'admin') {
                // Fixed admin credentials
                if (studentId.trim() === ADMIN_ID && password === ADMIN_PW) {
                    setAdminAuth(true)
                    toast.success('Admin access granted! 🔐')
                    navigate('/admin/dashboard')
                } else {
                    toast.error('Invalid admin credentials')
                }
            } else {
                await signIn({ studentId: studentId.trim(), password })
                toast.success('Welcome back! 🌿')
                navigate('/dashboard')
            }
        } catch (err) {
            const msg = err.message || 'Login failed. Check your credentials.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const isAdmin = mode === 'admin'

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)'
        }}>
            {/* Left Panel - Branding */}
            <div style={{
                flex: '1 1 50%', display: 'none', padding: '60px',
                background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 40%, #388e3c 100%)',
                position: 'relative', overflow: 'hidden',
                flexDirection: 'column', justifyContent: 'space-between',
            }} className="lg-show">
                <div style={{
                    position: 'absolute', top: '-100px', right: '-100px',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-150px', left: '-80px',
                    width: '350px', height: '350px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '60px' }}>
                        <div style={{
                            width: '44px', height: '44px',
                            background: 'rgba(255,255,255,0.15)', borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Leaf size={24} color="white" />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: 800, color: 'white', fontFamily: 'Poppins, sans-serif' }}>EcoVibe</span>
                    </Link>

                    <h2 style={{
                        fontSize: '38px', fontWeight: 700, color: 'white',
                        fontFamily: 'Poppins, sans-serif', lineHeight: 1.3, marginBottom: '20px'
                    }}>
                        {isAdmin ? 'Admin Portal 🔐' : 'Welcome back to your\ngreen journey 🌿'}
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '380px' }}>
                        {isAdmin
                            ? 'Manage challenge approvals, moderate feed content, and monitor all campus sustainability activity.'
                            : 'Track your carbon footprint, earn rewards, and make a real impact on your campus environment.'}
                    </p>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(isAdmin ? [
                            { icon: Shield, text: 'Approve challenge proofs' },
                            { icon: Users, text: 'Moderate social feed' },
                            { icon: Star, text: 'Monitor all activity' },
                        ] : [
                            { icon: Footprints, text: 'Track daily carbon emissions' },
                            { icon: Star, text: 'Earn EcoPoints for good habits' },
                            { icon: Shield, text: 'Join 2,500+ active students' },
                        ]).map((item, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '14px 18px', background: 'rgba(255,255,255,0.08)',
                                borderRadius: '14px', backdropFilter: 'blur(8px)'
                            }}>
                                <item.icon size={20} color="rgba(255,255,255,0.9)" />
                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{
                flex: '1 1 50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 24px'
            }}>
                <div style={{ width: '100%', maxWidth: '440px' }}>
                    {/* Mobile logo */}
                    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
                                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 24px rgba(76,175,80,0.3)'
                            }}>
                                <Leaf size={26} color="white" />
                            </div>
                        </Link>
                        <h1 style={{
                            fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif',
                            color: '#1f2937', marginBottom: '8px'
                        }}>
                            {isAdmin ? 'Admin Sign In' : 'Welcome back'}
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '15px' }}>
                            {isAdmin ? 'Sign in to the admin portal' : 'Sign in to your EcoVibe account'}
                        </p>
                    </div>

                    {/* Student / Admin Toggle */}
                    <div style={{
                        display: 'flex', gap: '4px', padding: '4px',
                        background: '#f3f4f6', borderRadius: '14px', marginBottom: '24px'
                    }}>
                        {[
                            { key: 'student', icon: Users, label: 'Student' },
                            { key: 'admin', icon: Shield, label: 'Admin' },
                        ].map(t => (
                            <button key={t.key} onClick={() => { setMode(t.key); setStudentId(''); setPassword('') }} style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                                border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                                background: mode === t.key ? 'white' : 'transparent',
                                color: mode === t.key ? '#2e7d32' : '#9ca3af',
                                boxShadow: mode === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                            }}>
                                <t.icon size={16} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(200,230,201,0.3)',
                        borderRadius: '20px', padding: '40px 36px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.06)'
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '22px' }}>
                                <label style={{
                                    display: 'block', fontSize: '13px', fontWeight: 600,
                                    color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                }}>
                                    {isAdmin ? 'Admin ID' : 'Roll Number / Email'}
                                </label>
                                <input
                                    type="text"
                                    placeholder={isAdmin ? 'Enter admin ID' : 'e.g. 21BCE1234 or address@email.com'}
                                    value={studentId}
                                    onChange={e => setStudentId(e.target.value)}
                                    autoComplete="username"
                                    style={{
                                        width: '100%', padding: '14px 18px',
                                        border: '2px solid #e8f5e9', borderRadius: '14px',
                                        fontSize: '15px', fontFamily: 'Inter, sans-serif',
                                        outline: 'none', transition: 'all 0.3s', background: 'white',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#4caf50'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.12)' }}
                                    onBlur={e => { e.target.style.borderColor = '#e8f5e9'; e.target.style.boxShadow = 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '28px' }}>
                                <label style={{
                                    display: 'block', fontSize: '13px', fontWeight: 600,
                                    color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        style={{
                                            width: '100%', padding: '14px 48px 14px 18px',
                                            border: '2px solid #e8f5e9', borderRadius: '14px',
                                            fontSize: '15px', fontFamily: 'Inter, sans-serif',
                                            outline: 'none', transition: 'all 0.3s', background: 'white',
                                            boxSizing: 'border-box'
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#4caf50'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.12)' }}
                                        onBlur={e => { e.target.style.borderColor = '#e8f5e9'; e.target.style.boxShadow = 'none' }}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                                        display: 'flex', alignItems: 'center', padding: '4px'
                                    }}>
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '16px 24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '15px', fontWeight: 700, borderRadius: '14px',
                                border: 'none', cursor: 'pointer',
                                background: 'linear-gradient(135deg, #66bb6a, #2e7d32)',
                                color: 'white', boxShadow: '0 4px 16px rgba(76,175,80,0.3)',
                                opacity: loading ? 0.7 : 1
                            }}>
                                {loading ? <Loader2 size={19} style={{ animation: 'spin 1s linear infinite' }} /> : isAdmin ? <Shield size={19} /> : <LogIn size={19} />}
                                {loading ? 'Signing in...' : isAdmin ? 'Sign In as Admin' : 'Sign In'}
                            </button>
                        </form>

                        {!isAdmin && (
                            <div style={{
                                textAlign: 'center', marginTop: '28px', paddingTop: '24px',
                                borderTop: '1px solid #f0f0f0'
                            }}>
                                <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                                    Don't have an account?{' '}
                                    <Link to="/signup" style={{ color: '#43a047', fontWeight: 700, textDecoration: 'none' }}>
                                        Sign up <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media (min-width: 1024px) { .lg-show { display: flex !important; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
