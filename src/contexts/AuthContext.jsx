import { createContext, useContext, useEffect, useState } from 'react'
import { insforge } from '../lib/insforge'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdminAuth, setIsAdminAuth] = useState(() => {
        return localStorage.getItem('ecovibe_admin') === 'true'
    })

    useEffect(() => {
        // Restore session from InsForge
        const checkUser = async () => {
            try {
                const { data, error } = await insforge.auth.getCurrentUser()
                if (data?.user) {
                    setUser(data.user)
                    // Fetch profile from our public.profiles table
                    let { data: profData } = await insforge.database
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .maybeSingle()
                    
                    if (!profData) {
                        // Self-healing: Create missing profile
                        // Extract name from email if auth user name is missing
                        const fallbackName = data.user.email?.split('@')[0] || 'EcoViber'
                        const displayName = data.user.name || fallbackName
                        
                        const { data: newProf, error: insErr } = await insforge.database
                            .from('profiles')
                            .insert({
                                id: data.user.id,
                                name: displayName,
                                contact_email: data.user.email,
                                eco_points: 10,
                                role: 'student'
                            })
                            .select()
                            .single()
                        if (!insErr) profData = newProf
                    }
                    
                    setProfile(profData || { id: data.user.id, name: data.user.email?.split('@')[0] || 'User' })
                }
            } catch (err) {
                console.error('Session check failed:', err)
            } finally {
                setLoading(false)
            }
        }
        checkUser()
    }, [])

    async function signUp({ studentId, email, name, department, year, password }) {
        const cleanStudentId = studentId.trim()
        const loginEmail = email ? email.trim().toLowerCase() : `${cleanStudentId.toLowerCase()}@ecovibe.campus`
        
        const { data, error } = await insforge.auth.signUp({
            email: loginEmail,
            password,
            name
        })

        if (error) throw error

        if (data?.user) {
            // Create entry in public.profiles table
            const { error: profError } = await insforge.database
                .from('profiles')
                .insert({
                    id: data.user.id,
                    student_id: cleanStudentId,
                    contact_email: loginEmail,
                    name,
                    department,
                    year,
                    eco_points: 10, // 10 point welcome bonus
                    role: 'student'
                })
            
            if (profError) console.error('Profile creation error:', profError)

            setUser(data.user)
            setProfile({ 
                id: data.user.id, 
                student_id: cleanStudentId, 
                name, 
                department, 
                year,
                eco_points: 10, 
                role: 'student' 
            })
        }

        return data
    }

    async function signIn({ studentId, password }) {
        const cleanId = studentId.trim()
        let loginEmail = cleanId

        if (!cleanId.includes('@')) {
            // Resolve Roll Number to Email
            const { data } = await insforge.database
                .from('profiles')
                .select('contact_email')
                .eq('student_id', cleanId)
                .maybeSingle()
            
            if (data?.contact_email) {
                loginEmail = data.contact_email.trim()
            } else {
                loginEmail = `${cleanId.toLowerCase()}@ecovibe.campus`
            }
        } else {
            loginEmail = cleanId.toLowerCase()
        }

        const { data, error } = await insforge.auth.signInWithPassword({
            email: loginEmail,
            password
        })

        if (error) throw error

        if (data?.user) {
            setUser(data.user)
            let { data: profData } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle()
            
            if (!profData) {
                // Self-healing: Create missing profile upon login
                const { data: newProf } = await insforge.database
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        name: data.user.name || 'New User',
                        contact_email: data.user.email,
                        eco_points: 10,
                        role: 'student'
                    })
                    .select()
                    .single()
                profData = newProf
            }
            setProfile(profData)
        }
        return data
    }


    async function signOut() {
        await insforge.auth.signOut()
        setUser(null)
        setProfile(null)
        setIsAdminAuth(false)
        localStorage.removeItem('ecovibe_admin')
    }

    function setAdminAuth(val) {
        setIsAdminAuth(val)
        if (val) localStorage.setItem('ecovibe_admin', 'true')
        else localStorage.removeItem('ecovibe_admin')
    }

    function adminLogout() {
        setIsAdminAuth(false)
        localStorage.removeItem('ecovibe_admin')
    }

    async function updateProfile(updates) {
        if (!user) return
        
        // Update public profiles table
        const { data, error } = await insforge.database
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()
        
        if (error) throw error
        
        setProfile(data)
        return data
    }

    const value = {
        user,
        profile,
        loading,
        connectionError: false,
        signUp,
        signIn,
        signOut,
        updateProfile,
        fetchProfile: async () => {
            if (!user) return
            const { data } = await insforge.database.from('profiles').select('*').eq('id', user.id).single()
            setProfile(data)
        },
        isAdmin: profile?.role === 'admin' || isAdminAuth,
        isAdminAuth,
        setAdminAuth,
        adminLogout,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
