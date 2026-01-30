import React, { useState, useEffect } from 'react';
import { User, Award, Droplets, Zap, Lightbulb, LogOut, TreeDeciduous, Plus } from 'lucide-react';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import './Profile.css';

const ALL_REMINDERS = [
    "Turn off lights when leaving a room.",
    "Bring your reusable bottle today.",
    "Check your tire pressure to save fuel.",
    "Unplug electronics when not in use.",
    "Use cold water for laundry whenever possible.",
    "Shorten your shower by 2 minutes to save water.",
    "Use a reusable bag for grocery shopping.",
    "Compost your organic waste."
];

const Profile = () => {
    const [stats, setStats] = useState({
        co2Total: 0,
        plasticAvoided: 0,
        treesPlanted: 0,
        score: 0
    });
    const [reminders, setReminders] = useState([]);

    useEffect(() => {
        // Load data
        const activities = loadData(STORAGE_KEYS.ACTIVITIES, []);
        const history = loadData(STORAGE_KEYS.CO2_HISTORY, []);
        const orders = loadData(STORAGE_KEYS.ORDERS, []);
        const savedTrees = loadData(STORAGE_KEYS.TREES, 0);
        const savedPlastic = loadData(STORAGE_KEYS.PLASTIC, 0);

        // Calculate CO2 from Today's Activities
        const todayCO2 = activities.reduce((sum, act) => sum + (act.co2 || 0), 0);

        // Calculate CO2 from History
        const historyCO2 = history.reduce((sum, day) => sum + parseFloat(day.total || 0), 0);

        // Total Cumulative CO2
        const co2Total = (todayCO2 + historyCO2).toFixed(1);

        // Eco Score Calculation
        // Base 500 + Activities*10 + HistoryEntries*20 + Orders*50 + Trees*100 + Plastic*5
        const score = Math.round(500 + (activities.length * 10) + (history.length * 20) + (orders.length * 50) + (savedTrees * 100) + (savedPlastic * 5));

        setStats({
            co2Total,
            plasticAvoided: savedPlastic,
            treesPlanted: savedTrees,
            score
        });

        // Random Reminders
        const shuffled = [...ALL_REMINDERS].sort(() => 0.5 - Math.random());
        setReminders(shuffled.slice(0, 3));

    }, []);

    const handleAddTree = () => {
        const newCount = stats.treesPlanted + 1;
        setStats(prev => ({ ...prev, treesPlanted: newCount }));
        saveData(STORAGE_KEYS.TREES, newCount);
    };

    const handleAddPlastic = () => {
        const newCount = stats.plasticAvoided + 1;
        setStats(prev => ({ ...prev, plasticAvoided: newCount }));
        saveData(STORAGE_KEYS.PLASTIC, newCount);
    };

    const facts = [
        "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
        "A glass bottle can take up to 1 million years to decompose.",
        "Switching to LED bulbs can reduce your energy consumption by up to 80%."
    ];

    return (
        <div className="container profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    R
                </div>
                <div className="profile-info">
                    <h1>Ritzz</h1>
                    <div className="profile-email">ritzz@example.com</div>
                    <div className="badge" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        background: 'var(--color-accent)', color: 'white', padding: '0.25rem 0.5rem',
                        borderRadius: '99px', fontSize: '0.85rem', fontWeight: '600'
                    }}>
                        <Award size={14} /> Eco Score: {stats.score}
                    </div>
                </div>
            </div>

            <div className="profile-stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.co2Total} kg</div>
                    <div className="stat-label">Total Carbon Footprint</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {stats.plasticAvoided}
                        <button onClick={handleAddPlastic} className="btn-icon-small" title="Add Plastic Item Avoided">
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="stat-label">Plastic Items Avoided</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {stats.treesPlanted}
                        <button onClick={handleAddTree} className="btn-icon-small" title="Track Tree Planted">
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="stat-label">Trees Planted</div>
                </div>
            </div>

            <section className="facts-section">
                <h2 className="section-title"><Lightbulb size={24} /> Did You Know?</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {facts.map((fact, index) => (
                        <div key={index} className="fact-item">
                            <strong>Fact #{index + 1}:</strong> {fact}
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h2 className="section-title" style={{ color: 'var(--color-primary)' }}>
                    <Zap size={24} /> Daily Reminders
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {reminders.map((reminder, index) => (
                        <div key={index} style={{
                            padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                            {reminder}
                        </div>
                    ))}
                </div>
            </section>

            <button className="logout-btn">
                <LogOut size={18} style={{ display: 'inline', marginRight: '0.5rem' }} /> Log Out
            </button>
        </div>
    );
};

export default Profile;
