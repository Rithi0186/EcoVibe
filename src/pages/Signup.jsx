import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { Leaf, UserPlus, Loader2, Eye, EyeOff, TreePine, Recycle, Award, ChevronRight } from 'lucide-react'

const DEPARTMENTS = [
    'Computer Science', 'Electronics', 'Mechanical', 'Civil',
    'Electrical', 'Information Technology', 'Chemical',
    'Biotechnology', 'Mathematics', 'Physics', 'Other'
]

export default function Signup() {
    const [form, setForm] = useState({
        studentId: '', email: '', name: '', department: '',
        year: '1', password: '', confirmPassword: ''
    })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()
    const toast = useToast()
    const navigate = useNavigate()

    function update(key, val) {
        setForm(prev => ({ ...prev, [key]: val }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.studentId.trim() || !form.email.trim() || !form.name.trim() || !form.department || !form.password) {
            toast.warning('Please fill in all required fields')
            return
        }
        if (form.password.length < 6) {
            toast.warning('Password must be at least 6 characters')
            return
        }
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            await signUp({
                studentId: form.studentId.trim(),
                email: form.email.trim(),
                name: form.name.trim(),
                department: form.department,
                year: form.year,
                password: form.password,
            })
            toast.success('Account created! Please check your email to verify your account. 🌱')
            navigate('/login')
        } catch (err) {
            const msg = err.message || 'Signup failed. Please try again.'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%', padding: '14px 18px',
        border: '2px solid #e8f5e9', borderRadius: '14px',
        fontSize: '15px', fontFamily: 'Inter, sans-serif',
        outline: 'none', transition: 'all 0.3s', background: 'white',
        boxSizing: 'border-box'
    }

    function handleFocus(e) { e.target.style.borderColor = '#4caf50'; e.target.style.boxShadow = '0 0 0 3px rgba(76,175,80,0.12)' }
    function handleBlur(e) { e.target.style.borderColor = '#e8f5e9'; e.target.style.boxShadow = 'none' }

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
                        Start your green<br />campus journey 🌱
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '380px' }}>
                        Join the movement. Track emissions, earn rewards, and make your campus more sustainable.
                    </p>
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { icon: TreePine, text: 'Reduce your carbon footprint' },
                            { icon: Recycle, text: 'Swap & trade on GreenSwap' },
                            { icon: Award, text: 'Earn badges & unlock rewards' },
                        ].map((item, i) => (
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
                padding: '40px 24px', overflowY: 'auto'
            }}>
                <div style={{ width: '100%', maxWidth: '480px' }}>
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
                            color: '#1f2937', marginBottom: '6px'
                        }}>
                            Join EcoVibe
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '15px' }}>Start your sustainability journey today</p>
                    </div>

                    {/* Form Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(200,230,201,0.3)',
                        borderRadius: '20px', padding: '40px 36px',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.06)'
                    }}>
                        <form onSubmit={handleSubmit}>
                            {/* Roll Number */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{
                                    display: 'block', fontSize: '13px', fontWeight: 600,
                                    color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                }}>
                                    Roll Number <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text" placeholder="e.g. 727624bea001"
                                    value={form.studentId}
                                    onChange={e => update('studentId', e.target.value)}
                                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                                />
                            </div>

                            {/* Full Name */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{
                                    display: 'block', fontSize: '13px', fontWeight: 600,
                                    color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                }}>
                                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text" placeholder="Your full name"
                                    value={form.name}
                                    onChange={e => update('name', e.target.value)}
                                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                                />
                            </div>

                            {/* Email Address */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{
                                    display: 'block', fontSize: '13px', fontWeight: 600,
                                    color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                }}>
                                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="email" placeholder="Your genuine email"
                                    value={form.email}
                                    onChange={e => update('email', e.target.value)}
                                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                                />
                            </div>

                            {/* Department + Year Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                                <div>
                                    <label style={{
                                        display: 'block', fontSize: '13px', fontWeight: 600,
                                        color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                    }}>
                                        Department <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <select
                                        value={form.department}
                                        onChange={e => update('department', e.target.value)}
                                        style={{ ...inputStyle, appearance: 'auto', color: form.department ? '#1f2937' : '#9ca3af' }}
                                        onFocus={handleFocus} onBlur={handleBlur}
                                    >
                                        <option value="">Select...</option>
                                        {DEPARTMENTS.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block', fontSize: '13px', fontWeight: 600,
                                        color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                    }}>
                                        Year <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <select
                                        value={form.year}
                                        onChange={e => update('year', e.target.value)}
                                        style={{ ...inputStyle, appearance: 'auto' }}
                                        onFocus={handleFocus} onBlur={handleBlur}
                                    >
                                        {[1, 2, 3, 4, 5].map(y => (
                                            <option key={y} value={y}>Year {y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{
                                    display: 'block', fontSize: '13px', fontWeight: 600,
                                    color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                }}>
                                    Password <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Min 6 characters"
                                        value={form.password}
                                        onChange={e => update('password', e.target.value)}
                                        style={{ ...inputStyle, paddingRight: '48px' }}
                                        onFocus={handleFocus} onBlur={handleBlur}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        style={{
                                            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                                            display: 'flex', alignItems: 'center', padding: '4px'
                                        }}
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div style={{ marginBottom: '28px' }}>
                                <label style={{
                                    display: 'block', fontSize: '13px', fontWeight: 600,
                                    color: '#374151', marginBottom: '8px', letterSpacing: '0.3px'
                                }}>
                                    Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={e => update('confirmPassword', e.target.value)}
                                    style={inputStyle} onFocus={handleFocus} onBlur={handleBlur}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="eco-btn"
                                style={{
                                    width: '100%', padding: '16px 24px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                    fontSize: '15px', fontWeight: 700, borderRadius: '14px'
                                }}
                            >
                                {loading ? <Loader2 size={19} className="animate-spin" /> : <UserPlus size={19} />}
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                        <div style={{
                            textAlign: 'center', marginTop: '24px', paddingTop: '20px',
                            borderTop: '1px solid #f0f0f0'
                        }}>
                            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                                Already have an account?{' '}
                                <Link to="/login" style={{
                                    color: '#43a047', fontWeight: 700, textDecoration: 'none'
                                }}>
                                    Sign in <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .lg-show { display: flex !important; }
                }
            `}</style>
        </div>
    )
}
