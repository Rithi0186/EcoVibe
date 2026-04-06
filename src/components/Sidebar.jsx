import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard, Activity, Recycle, Users, Trophy, Gift, User,
    BarChart3, Trash2, Info, Leaf
} from 'lucide-react'

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tracking', icon: Activity, label: 'CO2 Tracking' },
    { to: '/greenswap', icon: Recycle, label: 'GreenSwap' },
    { to: '/complaints', icon: Trash2, label: 'Complaints' },
    { to: '/eco-drives', icon: Leaf, label: 'Eco Drives' },
    { to: '/feed', icon: Users, label: 'Social Feed' },
    { to: '/challenges', icon: Trophy, label: 'Challenges' },
    { to: '/rewards', icon: Gift, label: 'Rewards' },

    { to: '/profile', icon: User, label: 'Profile' },
]

export default function Sidebar() {
    return (
        <>
            <aside style={{
                position: 'fixed', top: '64px', left: 0, bottom: 0, width: '240px',
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
                borderRight: '1px solid rgba(200,230,201,0.3)',
                padding: '20px 12px', overflowY: 'auto',
                display: 'none', flexDirection: 'column', gap: '4px', zIndex: 40
            }} className="sidebar-desktop">
                {NAV_ITEMS.map(item => (
                    <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: '12px',
                        fontSize: '14px', fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#2e7d32' : '#6b7280',
                        background: isActive ? '#e8f5e9' : 'transparent',
                        textDecoration: 'none', transition: 'all 0.2s'
                    })}>
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
            </aside>

            {/* Mobile bottom bar */}
            <nav style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
                borderTop: '1px solid rgba(200,230,201,0.3)',
                display: 'flex', justifyContent: 'space-around', padding: '8px 0',
                boxShadow: '0 -2px 20px rgba(0,0,0,0.05)'
            }} className="mobile-nav">
                {NAV_ITEMS.slice(0, 5).map(item => (
                    <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                        padding: '4px 8px', borderRadius: '8px',
                        fontSize: '10px', fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#2e7d32' : '#9ca3af',
                        textDecoration: 'none'
                    })}>
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <style>{`
                @media (min-width: 1024px) {
                    .sidebar-desktop { display: flex !important; }
                    .mobile-nav { display: none !important; }
                }
                @media (max-width: 1023px) {
                    .sidebar-desktop { display: none !important; }
                    .mobile-nav { display: flex !important; }
                }
            `}</style>
        </>
    )
}
