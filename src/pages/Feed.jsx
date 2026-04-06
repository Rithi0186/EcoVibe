import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'
import { ListSkeleton } from '../components/LoadingSkeleton'
import {
    MessageSquare, Heart, Send, Image, X, Loader2,
    MessageCircle, Tag, Clock
} from 'lucide-react'

const TAGS = ['🌱 Tree Planting', '♻️ Recycling', '🚲 Cycling', '🥗 Veg Diet', '⚡ Energy Saving', '📦 Reuse', '🌍 Climate Action']

const card = {
    background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px',
    boxShadow: '0 4px 30px rgba(0,0,0,0.06)'
}

const inputStyle = {
    width: '100%', padding: '12px 16px', border: '2px solid #e8f5e9',
    borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter, sans-serif',
    outline: 'none', background: 'white'
}

export default function Feed() {
    const { user, profile, updateProfile } = useAuth()
    const toast = useToast()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [newPost, setNewPost] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [imageFile, setImageFile] = useState(null)
    const [posting, setPosting] = useState(false)
    const [commentText, setCommentText] = useState({})
    const [expandedComments, setExpandedComments] = useState({})

    useEffect(() => { loadPosts() }, [])

    async function loadPosts() {
        try {
            const allPosts = await db.getAll('posts')
            const sorted = allPosts
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 30)
            
            // Enrich posts with profile, likes, comments
            const enriched = await Promise.all(sorted.map(async post => {
                const userProfile = await db.getById('profiles', post.user_id)
                const likes = await db.query('post_likes', { post_id: post.id })
                const rawComments = await db.query('post_comments', { post_id: post.id })
                const enrichedComments = await Promise.all(rawComments.map(async c => ({
                    ...c, 
                    profiles: await db.getById('profiles', c.user_id)
                })))
                return { ...post, profiles: userProfile, post_likes: likes, post_comments: enrichedComments }
            }))
            setPosts(enriched)
        } catch (err) { console.error(err) }
        finally { setLoading(false) }
    }

    async function handlePost(e) {
        e.preventDefault()
        if (!newPost.trim()) { toast.warning('Write something to share!'); return }
        setPosting(true)
        try {
            let imageUrl = null
            if (imageFile) {
                const fileName = `${user.id}-${Date.now()}-${imageFile.name}`
                const data = await db.upload('post_images', fileName, imageFile)
                imageUrl = data.url
            }
            await db.insert('posts', {
                user_id: user.id, 
                student_id: profile?.student_id,
                content: newPost.trim(), 
                image_url: imageUrl, 
                tags: selectedTags,
                points_awarded: 5,
            })
            // Update profile points
            const newPoints = (profile?.eco_points || 0) + 5
            await updateProfile({ eco_points: newPoints })
            toast.success('Post shared! +5 EcoPoints 🌿')
            setNewPost(''); setSelectedTags([]); setImageFile(null)
            await loadPosts()
        } catch (err) { toast.error(err.message) }
        finally { setPosting(false) }
    }

    async function toggleLike(post) {
        const liked = post.post_likes?.some(l => l.user_id === user.id)
        try {
            if (liked) {
                const like = post.post_likes.find(l => l.user_id === user.id)
                await db.remove('post_likes', like.id)
            } else {
                await db.insert('post_likes', { post_id: post.id, user_id: user.id })
            }
            await loadPosts()
        } catch (err) { toast.error(err.message) }
    }

    async function addComment(postId) {
        const text = commentText[postId]
        if (!text?.trim()) return
        try {
            await db.insert('post_comments', {
                post_id: postId, user_id: user.id, student_id: profile?.student_id, comment: text.trim(),
            })
            setCommentText(prev => ({ ...prev, [postId]: '' }))
            await loadPosts()
        } catch (err) { toast.error(err.message) }
    }

    function toggleTag(tag) {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    }

    if (loading) return <ListSkeleton rows={4} />

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto' }}>
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Sustainability Feed</h1>
                <p style={{ color: '#9ca3af', marginTop: '4px' }}>Share your eco-journey with the campus</p>
            </div>

            {/* Create Post */}
            <div style={{ ...card, padding: '24px' }}>
                <form onSubmit={handlePost}>
                    <textarea
                        style={{ ...inputStyle, minHeight: '100px', resize: 'none', marginBottom: '12px' }}
                        placeholder="Share your sustainability win... 🌍"
                        value={newPost} onChange={e => setNewPost(e.target.value)}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        {TAGS.map(tag => (
                            <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                                padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
                                border: 'none', cursor: 'pointer',
                                background: selectedTags.includes(tag) ? '#4caf50' : '#e8f5e9',
                                color: selectedTags.includes(tag) ? 'white' : '#2e7d32'
                            }}>{tag}</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280' }}>
                            <Image size={18} />
                            <span>{imageFile ? imageFile.name : 'Add Image'}</span>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files[0] || null)} />
                            {imageFile && (
                                <button type="button" onClick={() => setImageFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                    <X size={14} />
                                </button>
                            )}
                        </label>
                        <button type="submit" disabled={posting} className="eco-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', padding: '10px 20px' }}>
                            {posting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                            Post
                        </button>
                    </div>
                </form>
            </div>

            {/* Posts */}
            {posts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {posts.map(post => {
                        const liked = post.post_likes?.some(l => l.user_id === user.id)
                        const likeCount = post.post_likes?.length || 0
                        const commentCount = post.post_comments?.length || 0
                        const showComments = expandedComments[post.id]

                        return (
                            <div key={post.id} style={{ ...card, padding: '20px' }}>
                                {/* Author */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '36px', height: '36px',
                                        background: 'linear-gradient(135deg, #81c784, #4caf50)',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '12px', fontWeight: 700
                                    }}>
                                        {post.profiles?.name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{post.profiles?.name}</p>
                                        <p style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} />
                                            {new Date(post.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            {' · '}{post.student_id}
                                        </p>
                                    </div>
                                </div>

                                <p style={{ color: '#374151', lineHeight: 1.6, marginBottom: '12px' }}>{post.content}</p>

                                {post.image_url && (
                                    <img src={post.image_url} alt="" style={{ width: '100%', height: '256px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} />
                                )}

                                {post.tags?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                        {post.tags.map(t => (
                                            <span key={t} style={{ padding: '2px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '100px', fontSize: '10px', fontWeight: 500 }}>{t}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                                    <button onClick={() => toggleLike(post)} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500,
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: liked ? '#ef4444' : '#9ca3af'
                                    }}>
                                        <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> {likeCount}
                                    </button>
                                    <button onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500,
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af'
                                    }}>
                                        <MessageCircle size={16} /> {commentCount}
                                    </button>
                                </div>

                                {/* Comments */}
                                {showComments && (
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f9fafb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {post.post_comments?.map(c => (
                                            <div key={c.id} style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>
                                                <span style={{ fontWeight: 600, color: '#374151' }}>{c.profiles?.name || c.student_id}</span>
                                                <span style={{ color: '#6b7280' }}>{c.comment}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <input
                                                style={{ ...inputStyle, fontSize: '14px', padding: '8px 12px' }}
                                                placeholder="Write a comment..."
                                                value={commentText[post.id] || ''}
                                                onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                                            />
                                            <button onClick={() => addComment(post.id)} className="eco-btn" style={{ padding: '8px 12px' }}>
                                                <Send size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
                    <MessageSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <p>No posts yet. Be the first to share!</p>
                </div>
            )}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
