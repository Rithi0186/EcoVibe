import { useState, useEffect, useMemo } from 'react'
import { db } from '../lib/db'
import { computeFeatures } from '../lib/featureEngine'
import { predictNextDayCO2 } from '../lib/aiPredictor'
import { detectAnomaly } from '../lib/anomalyDetector'
import { classifyLifestyle } from '../lib/userClustering'

/**
 * Custom hook that runs the full AI pipeline on the user's CO₂ log history.
 *
 * @param {string} userId — user ID
 * @param {Array}  [providedLogs] — optional: pass logs directly instead of fetching
 * @returns {{ prediction, features, anomaly, archetype, loading, error }}
 */
export function useAIPrediction(userId, providedLogs) {
    const [logs, setLogs] = useState(providedLogs || [])
    const [loading, setLoading] = useState(!providedLogs)
    const [error, setError] = useState(null)

    // Fetch logs from InsForge if not provided
    useEffect(() => {
        if (providedLogs) {
            setLogs(providedLogs)
            setLoading(false)
            return
        }
        if (!userId) {
            setLoading(false)
            return
        }

        async function fetchLogs() {
            setLoading(true)
            try {
                const data = await db.query('co2_logs', { user_id: userId })
                const sorted = data
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 200)
                setLogs(sorted)
            } catch (err) {
                console.warn('AI Prediction: failed to fetch logs', err.message)
                setError(err.message)
                setLogs([])
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [userId, providedLogs])

    // Run the AI pipeline (memoised)
    const result = useMemo(() => {
        if (loading) return null

        const features = computeFeatures(logs)
        const prediction = predictNextDayCO2(features)
        const anomaly = detectAnomaly(features)
        const archetype = classifyLifestyle(features)

        return { features, prediction, anomaly, archetype }
    }, [logs, loading])

    return {
        prediction: result?.prediction ?? null,
        features: result?.features ?? null,
        anomaly: result?.anomaly ?? null,
        archetype: result?.archetype ?? null,
        loading,
        error,
        logsCount: logs.length,
    }
}
