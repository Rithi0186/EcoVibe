import React, { useState, useEffect } from 'react';
import { Car, Bike, Bus, Train, Footprints, Trash2 } from 'lucide-react';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';
import './CarbonFootprint.css';

const TRANSPORT_MODES = [
    { id: 'car', name: 'Car', factor: 0.2, icon: Car }, // kg per km
    { id: 'bus', name: 'Bus', factor: 0.1, icon: Bus },
    { id: 'train', name: 'Train', factor: 0.05, icon: Train },
    { id: 'bike', name: 'Bike', factor: 0, icon: Bike },
    { id: 'walk', name: 'Walk', factor: 0, icon: Footprints },
];

const TRANSPORT_ICONS_MAP = {
    car: Car, bus: Bus, train: Train, bike: Bike, walk: Footprints
};

const CarbonFootprint = () => {
    const [activities, setActivities] = useState([]);
    const [mode, setMode] = useState(TRANSPORT_MODES[0].id);
    const [distance, setDistance] = useState('');

    // Load from storage on mount
    useEffect(() => {
        const savedActivities = loadData(STORAGE_KEYS.ACTIVITIES, []);
        const history = loadData(STORAGE_KEYS.CO2_HISTORY, []);

        const today = new Date().toLocaleDateString();

        // Check for activities from previous days
        const previousActivities = savedActivities.filter(a => a.date && a.date !== today);
        const todaysActivities = savedActivities.filter(a => !a.date || a.date === today); // Keep legacy (no date) as today for safety, or clear them. Let's keep them to avoid data loss surprise, or migrate them. Better to just archive them if we assume they are old. Let's assume no-date = old if we are strict, but for user exp, let's migrate them to today OR just archive them.
        // Actually, if I just implemented this, existing data has NO date key. So `undefined !== today` is true. So they will be archived. This is acceptable "reset".

        if (previousActivities.length > 0) {
            const previousTotal = previousActivities.reduce((sum, act) => sum + (act.co2 || 0), 0);

            // Add to history if non-zero
            if (previousTotal > 0) {
                const historyEntry = {
                    date: previousActivities[0].date || 'Previous',
                    total: previousTotal.toFixed(2)
                };
                const newHistory = [historyEntry, ...history];
                saveData(STORAGE_KEYS.CO2_HISTORY, newHistory);
            }

            // Update activities to only show today's
            setActivities(todaysActivities);
            saveData(STORAGE_KEYS.ACTIVITIES, todaysActivities);
        } else {
            setActivities(savedActivities);
        }
    }, []);

    // Save to storage whenever activities change
    useEffect(() => {
        if (activities.length > 0) {
            saveData(STORAGE_KEYS.ACTIVITIES, activities);
        } else {
            // If activities become empty, ensure storage is also cleared
            saveData(STORAGE_KEYS.ACTIVITIES, []);
        }
    }, [activities]);

    const handleAddActivity = (e) => {
        e.preventDefault();
        if (!distance || isNaN(distance)) return;

        const selectedMode = TRANSPORT_MODES.find(m => m.id === mode);
        // Formula: CO2 Emissions (kg) = Distance Traveled (km) × Emission Factor (kg CO₂/km)
        const co2 = (parseFloat(distance) * selectedMode.factor).toFixed(2);

        const newActivity = {
            id: Date.now(),
            mode: selectedMode, // This saves the whole object including 'id' e.g. 'car'
            distance: parseFloat(distance),
            co2: parseFloat(co2),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        };

        setActivities([newActivity, ...activities]);
        setDistance('');
    };

    const handleDelete = (id) => {
        const updated = activities.filter(a => a.id !== id);
        setActivities(updated);
        saveData(STORAGE_KEYS.ACTIVITIES, updated); // Explicit save for delete
    };

    const totalCO2 = activities.reduce((sum, act) => sum + act.co2, 0).toFixed(2);

    return (
        <div className="container footprint-container">

            {/* Main Section - Activity Log */}
            <section>
                <div className="footprint-form-card">
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Footprints className="text-primary" /> Log Daily Activity
                    </h2>
                    <form onSubmit={handleAddActivity}>
                        <div className="form-group">
                            <label className="form-label">Transport Mode</label>
                            <select
                                className="form-select"
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                            >
                                {TRANSPORT_MODES.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Distance (km)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="e.g. 15"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                min="0"
                                step="0.1"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Add Activity
                        </button>
                    </form>
                </div>

                <div className="activity-list">
                    <h3 style={{ marginBottom: '1rem' }}>Today's Activities</h3>
                    {activities.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                            No activities logged yet.
                        </p>
                    ) : (
                        activities.map(act => (
                            <div key={act.id} className="activity-item">
                                <div className="activity-icon">
                                    {React.createElement(TRANSPORT_ICONS_MAP[act.mode.id] || Car, { size: 24 })}
                                </div>
                                <div className="activity-details">
                                    <div className="activity-title">{act.mode.name}</div>
                                    <div className="activity-meta">{act.distance} km • {act.timestamp}</div>
                                </div>
                                <div className="activity-co2" style={{ marginRight: '1rem' }}>
                                    {act.co2} <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>kg CO₂</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(act.id)}
                                    className="btn-icon"
                                    style={{ color: '#EF4444' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Side Section - Consumption */}
            <aside>
                <div className="limit-display">
                    <h3>Today's Consumption</h3>
                    <div className="co2-total">
                        {totalCO2} <span className="co2-unit">kg</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Carbon Footprint</p>
                </div>

                {/* Optional: Tips or comparison */}
                <div className="card">
                    <h4>Did you know?</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        The average daily carbon footprint per person globally is about 11kg.
                        Aim to keep yours below 5kg!
                    </p>
                </div>
            </aside>

        </div>
    );
};

export default CarbonFootprint;
