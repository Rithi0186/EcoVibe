import { insforge } from './insforge'

export const db = {
    /** Get all rows from a table */
    async getAll(table) {
        const { data, error } = await insforge.database.from(table).select('*')
        if (error) throw error
        return data || []
    },

    /** Get a single row by ID */
    async getById(table, id) {
        const { data, error } = await insforge.database.from(table).select('*').eq('id', id).maybeSingle()
        if (error) throw error
        return data
    },

    /** Insert a new row */
    async insert(table, record) {
        const { data, error } = await insforge.database.from(table).insert([record]).select().single()
        if (error) throw error
        return data
    },

    /** Update a row by ID */
    async update(table, id, updates) {
        const { data, error } = await insforge.database.from(table).update(updates).eq('id', id).select().single()
        if (error) throw error
        return data
    },

    /** Delete a row by ID */
    async remove(table, id) {
        const { error } = await insforge.database.from(table).delete().eq('id', id)
        if (error) throw error
    },

    /** Query rows with filters (supports simple equality for compatibility) */
    async query(table, filterFnOrObj) {
        let query = insforge.database.from(table).select('*')
        
        // If it's an object, we can apply .eq() filters
        if (typeof filterFnOrObj === 'object' && filterFnOrObj !== null) {
            Object.entries(filterFnOrObj).forEach(([key, val]) => {
                query = query.eq(key, val)
            })
        }
        
        const { data, error } = await query
        if (error) throw error
        
        // If a function was passed, we apply it in-memory (legacy support)
        if (typeof filterFnOrObj === 'function') {
            return (data || []).filter(filterFnOrObj)
        }
        
        return data || []
    },

    /** Count rows (simplified) */
    async count(table, filterObj) {
        const results = await this.query(table, filterObj)
        return results.length
    },

    /** Storage: Upload a file to a bucket */
    async upload(bucket, path, file) {
        const { data, error } = await insforge.storage.from(bucket).upload(path, file)
        if (error) throw error
        return data
    },

    /** Storage: Get a public URL for a file */
    getPublicUrl(bucket, path) {
        const { data } = insforge.storage.from(bucket).getPublicUrl(path)
        return data.publicUrl
    }
}
