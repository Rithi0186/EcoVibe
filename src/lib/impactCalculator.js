/**
 * Impact coefficients for reused items (approximations)
 * Sources: Various environmental impact assessment databases
 */
export const REUSE_IMPACT = {
    Books: { co2: 1.2, water: 30, trees: 0.05 },
    Stationery: { co2: 0.5, water: 5, trees: 0.01 },
    Electronics: { co2: 150, water: 12000, trees: 0 },
    Clothing: { co2: 25, water: 2700, trees: 0 },
    Sports: { co2: 15, water: 100, trees: 0 },
    Other: { co2: 2, water: 50, trees: 0.01 },
    // Crafts
    'Home Decor': { co2: 5, water: 20, trees: 0.02 },
    Accessories: { co2: 3, water: 10, trees: 0 },
    Art: { co2: 2, water: 5, trees: 0.01 },
    Bags: { co2: 10, water: 200, trees: 0 },
}

/**
 * Calculate the impact saved for a given list of reused items or a single item
 */
export function calculateImpactSaved(category, quantity = 1) {
    const impact = REUSE_IMPACT[category] || REUSE_IMPACT['Other']
    return {
        co2: parseFloat((impact.co2 * quantity).toFixed(2)),
        water: Math.round(impact.water * quantity),
        trees: parseFloat((impact.trees * quantity).toFixed(2)),
    }
}
