// CO2 Emission Coefficients
// Units: kg CO2 per unit (km for transport, per meal for food, per hour for electricity)

export const CO2_COEFFICIENTS = {
    transport: {
        walk: 0,
        bicycle: 0,
        bus: 0.089,
        bike: 0.05,
        carpool: 0.045,
        car: 0.21,
    },
    food: {
        veg: 0.5,
        mixed: 1.5,
        'non-veg': 3.0,
    },
    electricity: {
        fan: 0.05,
        light: 0.02,
        laptop: 0.05,
        ac: 0.9,
    },
    waste: {
        recycled: -0.5,   // negative = savings
        composted: -0.3,
        none: 0,
    },
}

// Points awarded for eco-positive choices
export const ECO_POINTS = {
    transport: {
        walk: 20,
        bicycle: 15,
        bus: 5,
        carpool: 10,
        bike: 3,
        car: 0,
    },
    food: {
        veg: 15,
        mixed: 5,
        'non-veg': 0,
    },
    waste: {
        recycled: 10,
        composted: 15,
        none: 0,
    },
    electricity: {
        low: 10,    // < 2 hours
        medium: 5,  // 2-5 hours
        high: 0,    // > 5 hours
    },
}

/**
 * Calculate CO2 emissions and EcoPoints from a log entry
 */
export function calculateCO2(entry) {
    let totalCO2 = 0
    let totalPoints = 0
    const breakdown = {}

    // Transport
    if (entry.transportMode && entry.km > 0) {
        const co2 = (CO2_COEFFICIENTS.transport[entry.transportMode] || 0) * entry.km
        const pts = ECO_POINTS.transport[entry.transportMode] || 0
        totalCO2 += co2
        totalPoints += pts
        breakdown.transport = { co2, points: pts, mode: entry.transportMode, km: entry.km }
    }

    // Food
    if (entry.foodType && entry.meals > 0) {
        const co2 = (CO2_COEFFICIENTS.food[entry.foodType] || 0) * entry.meals
        const pts = ECO_POINTS.food[entry.foodType] || 0
        totalCO2 += co2
        totalPoints += pts * entry.meals
        breakdown.food = { co2, points: pts * entry.meals, type: entry.foodType, meals: entry.meals }
    }

    // Electricity
    if (entry.electricityHours > 0) {
        const devices = entry.devices || ['laptop']
        let co2 = 0
        devices.forEach(device => {
            co2 += (CO2_COEFFICIENTS.electricity[device] || 0.05) * entry.electricityHours
        })
        const ptsKey = entry.electricityHours < 2 ? 'low' : entry.electricityHours <= 5 ? 'medium' : 'high'
        const pts = ECO_POINTS.electricity[ptsKey]
        totalCO2 += co2
        totalPoints += pts
        breakdown.electricity = { co2, points: pts, hours: entry.electricityHours }
    }

    // Waste
    if (entry.wasteAction && entry.wasteAction !== 'none') {
        const co2 = CO2_COEFFICIENTS.waste[entry.wasteAction] || 0
        const pts = ECO_POINTS.waste[entry.wasteAction] || 0
        totalCO2 += co2
        totalPoints += pts
        breakdown.waste = { co2, points: pts, action: entry.wasteAction }
    }

    return {
        totalCO2: Math.max(0, parseFloat(totalCO2.toFixed(2))),
        totalPoints: 0,
        breakdown,
    }
}
