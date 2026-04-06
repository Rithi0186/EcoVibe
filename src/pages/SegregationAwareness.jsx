import { 
    Info, Trash2, Recycle, Leaf, 
    CheckCircle, AlertTriangle, HelpCircle, 
    ArrowRight, Lightbulb, ExternalLink
} from 'lucide-react'

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}

export default function SegregationAwareness() {
    const BINS = [
        { 
            type: 'Green Bin', 
            label: 'Biodegradable Waste', 
            color: '#10b981', 
            icon: Leaf,
            items: ['Food scraps', 'Vegetable peels', 'Fruit waste', 'Tea bags', 'Flowers'],
            donts: ['Plastic', 'Glass', 'Metal', 'Dry leaves (compost separately)']
        },
        { 
            type: 'Blue Bin', 
            label: 'Dry (Recyclable) Waste', 
            color: '#3b82f6', 
            icon: Recycle,
            items: ['Cardboard', 'Tetra packs', 'Clean plastic bottles', 'Paper', 'Empty cans'],
            donts: ['Food soiled items', 'Wet waste', 'Chemicals', 'Tissue paper']
        },
        { 
            type: 'Yellow Bin', 
            label: 'Paper Waste', 
            color: '#eab308', 
            icon: HelpCircle,
            items: ['Notebooks', 'Exam papers', 'Envelopes', 'Magazines', 'Newspapers'],
            donts: ['Carbon paper', 'Metallic paper', 'Taped paper']
        },
        { 
            type: 'Red Bin', 
            label: 'Hazadous/Electronic', 
            color: '#ef4444', 
            icon: AlertTriangle,
            items: ['Batteries', 'Bulbs', 'Old wires', 'Medicine strips', 'Paint cans'],
            donts: ['Regular trash', 'Food', 'General waste']
        },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Waste Segregation Awareness</h1>
                <p style={{ color: '#9ca3af', marginTop: '4px' }}>Learn and practice proper disposal habits at campus</p>
            </div>

            {/* Banner */}
            <div style={{ ...card, padding: '32px', background: 'linear-gradient(135deg, #4caf50, #2e7d32)', border: 'none', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Segregate Right, Future's Bright! 🌍</h2>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', maxWidth: '500px', lineHeight: 1.6 }}>Did you know that 60% of campus waste can be composted or recycled if segregated properly? Be a responsible student.</p>
                </div>
                <Recycle size={180} style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.1, color: 'white' }} />
            </div>

            {/* Bins Guide */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {BINS.map((bin, i) => (
                    <div key={i} style={{ ...card, padding: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', background: `${bin.color}15` }}>
                                <bin.icon size={24} color={bin.color} />
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: bin.color, textTransform: 'uppercase' }}>{bin.type}</span>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>{bin.label}</h3>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                <CheckCircle size={14} /> YES (Put inside)
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {bin.items.map((item, j) => (
                                    <span key={j} style={{ padding: '4px 8px', borderRadius: '6px', background: '#f0fdf4', color: '#166534', fontSize: '11px', fontWeight: 600 }}>{item}</span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                <AlertTriangle size={14} /> NO (Keep out)
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {bin.donts.map((item, j) => (
                                    <span key={j} style={{ padding: '4px 8px', borderRadius: '6px', background: '#fef2f2', color: '#991b1b', fontSize: '11px', fontWeight: 600 }}>{item}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Impact and Tips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="aware-grid">
                <div style={{ ...card, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Lightbulb size={20} color="#eab308" />
                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Eco-Hub Tips</h3>
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, listStyle: 'none' }}>
                        {[
                            'Rinse food containers before putting them in the dry waste bin.',
                            'Fold cardboard boxes to save space in bins.',
                            'Remove plastic caps from paper cups; they go in different bins!',
                            'Avoid using multiple bin liners; they add to plastic waste.',
                            'Use the centralized campus e-waste bin for batteries.'
                        ].map((tip, i) => (
                            <li key={i} style={{ fontSize: '13px', color: '#4b5563', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <ArrowRight size={14} style={{ marginTop: '2px', color: '#4caf50', flexShrink: 0 }} />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ ...card, padding: '24px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#92400e', marginBottom: '10px' }}>Did you know?</h4>
                        <p style={{ fontSize: '13px', color: '#b45309', lineHeight: 1.6 }}>Aluminum cans can be recycled and back into store shelves in as little as 60 days. Recycling one aluminum can saves enough energy to run a TV for three hours!</p>
                    </div>
                    <button style={{ ...card, border: 'none', background: 'white', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ExternalLink size={18} color="#6b7280" />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>Official Campus Waste Policy</span>
                        </div>
                        <ArrowRight size={16} color="#9ca3af" />
                    </button>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .aware-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}
