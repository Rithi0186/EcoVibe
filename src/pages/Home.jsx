import React, { useState, useEffect } from 'react';
import './Home.css';
import { Wind, Thermometer, CloudRain, MapPin, Share2, Image as ImageIcon, Send } from 'lucide-react';
import { loadData, saveData, STORAGE_KEYS } from '../utils/storage';

const DEFAULT_POSTS = [
    {
        id: 1,
        title: "10 Simple Ways to Reduce Plastic Waste",
        desc: "Discover daily habits that can significantly reduce your plastic footprint. From reusable bags to bamboo toothbrushes, small changes make a big impact.",
        image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=800&auto=format&fit=crop",
        author: "EcoVibe Team",
        date: "Today"
    },
    {
        id: 2,
        title: "The Future of Renewable Energy",
        desc: "Solar and wind energy are becoming cheaper and more accessible. Learn how the global shift towards renewables is reshaping our economy and planet.",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop",
        author: "EcoVibe Team",
        date: "Yesterday"
    },
    {
        id: 3,
        title: "Understanding Carbon Offsets",
        desc: "What exactly are carbon offsets? Are they a solution or a band-aid? We dive deep into how they work and how you can choose effective projects.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b43?q=80&w=800&auto=format&fit=crop",
        author: "EcoVibe Team",
        date: "2 days ago"
    }
];

const Home = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [weatherData, setWeatherData] = useState({
        temperature: '--',
        aqi: '--',
        location: 'Locating...'
    });

    const [posts, setPosts] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', desc: '', image: '' });

    useEffect(() => {
        // Load Posts
        const savedPosts = loadData(STORAGE_KEYS.POSTS, DEFAULT_POSTS);
        setPosts(savedPosts);

        // Geolocation Logic
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Fetch Weather
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`);
                    const weatherJson = await weatherRes.json();

                    // Fetch Air Quality
                    const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`);
                    const aqiJson = await aqiRes.json();

                    setWeatherData({
                        temperature: `${weatherJson.current.temperature_2m}°C`,
                        aqi: aqiJson.current.us_aqi,
                        location: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`
                    });
                } catch (error) {
                    console.error("Error fetching data:", error);
                    setWeatherData({ ...weatherData, location: 'Error fetching data' });
                } finally {
                    setIsLoading(false);
                }
            }, (error) => {
                console.error("Geolocation error:", error);
                setWeatherData({ ...weatherData, location: 'Location access denied' });
                setIsLoading(false);
            });
        } else {
            setWeatherData({ ...weatherData, location: 'Geolocation not supported' });
            setIsLoading(false);
        }
    }, []);

    const handleCreatePost = (e) => {
        e.preventDefault();
        const post = {
            id: Date.now(),
            title: newPost.title,
            desc: newPost.desc,
            image: newPost.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b43?q=80&w=800&auto=format&fit=crop", // Default fallback
            author: "You",
            date: "Just now"
        };
        const updatedPosts = [post, ...posts];
        setPosts(updatedPosts);
        saveData(STORAGE_KEYS.POSTS, updatedPosts);
        setNewPost({ title: '', desc: '', image: '' });
        setIsCreating(false);
    };

    const handleShare = (post) => {
        const text = `${post.title} - ${post.desc}`;
        navigator.clipboard.writeText(text).then(() => {
            alert("Post content copied to clipboard!");
        });
    };

    return (
        <div className="container home-container">
            {/* Main Content - Feed */}
            <section className="blog-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Community Feed</h2>
                    {!isCreating && (
                        <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                            Create Post
                        </button>
                    )}
                </div>

                {isCreating && (
                    <div className="create-post-card">
                        <h3>Share your thoughts</h3>
                        <form onSubmit={handleCreatePost}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Title"
                                    required
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <textarea
                                    className="form-input"
                                    placeholder="What's on your mind?"
                                    rows="3"
                                    required
                                    value={newPost.desc}
                                    onChange={e => setNewPost({ ...newPost, desc: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ImageIcon size={20} color="var(--color-text-muted)" />
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="Image URL (Unsplash, etc.)"
                                        value={newPost.image}
                                        onChange={e => setNewPost({ ...newPost, image: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn" onClick={() => setIsCreating(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Post</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="blog-grid">
                    {posts.map(post => (
                        <article key={post.id} className="blog-card">
                            <div className="blog-image">
                                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="blog-content">
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    <span>{post.author}</span>
                                    <span>{post.date}</span>
                                </div>
                                <h3 className="blog-title">{post.title}</h3>
                                <p className="blog-desc">{post.desc}</p>
                                <button
                                    className="btn-icon-small"
                                    onClick={() => handleShare(post)}
                                    style={{ marginTop: '1rem', width: '32px', height: '32px' }}
                                    title="Share"
                                >
                                    <Share2 size={16} />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Side Panel - Indicators */}
            <aside className="side-panel">
                <div className="indicator-card">
                    <div className="indicator-sub" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {isLoading ? 'Locating...' : weatherData.location}
                    </div>

                    <div className="indicator-title">
                        <Wind size={18} /> Air Quality (AQI)
                    </div>
                    <div className="indicator-value">{isLoading ? '...' : weatherData.aqi}</div>
                    <div className="indicator-sub">Real-time (Open-Meteo)</div>
                </div>

                <div className="indicator-card" style={{ borderLeftColor: '#EF4444' }}>
                    <div className="indicator-title">
                        <Thermometer size={18} /> Temperature
                    </div>
                    <div className="indicator-value">{weatherData.temperature}</div>
                    <div className="indicator-sub">Current Local Temp</div>
                </div>

                <div className="indicator-card" style={{ borderLeftColor: '#3B82F6' }}>
                    <div className="indicator-title">
                        <CloudRain size={18} /> CO2 Levels
                    </div>
                    <div className="indicator-value">419 ppm</div>
                    <div className="indicator-sub">Global Avg (Static)</div>
                </div>
            </aside>
        </div>
    );
};

export default Home;
