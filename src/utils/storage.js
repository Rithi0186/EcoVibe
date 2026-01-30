const STORAGE_KEYS = {
    ACTIVITIES: 'ecovibe_activities',
    PRODUCTS: 'ecovibe_products',
    ORDERS: 'ecovibe_orders',
    USER: 'ecovibe_user',
    REMINDERS: 'ecovibe_reminders',
    TREES: 'ecovibe_trees',
    PLASTIC: 'ecovibe_plastic',
    POSTS: 'ecovibe_posts',
    CO2_HISTORY: 'ecovibe_co2_history'
};

export const loadData = (key, defaultValue) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error loading data for ${key}:`, error);
        return defaultValue;
    }
};

export const saveData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving data for ${key}:`, error);
    }
};

export const clearData = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error clearing data for ${key}:`, error);
    }
};

export { STORAGE_KEYS };
