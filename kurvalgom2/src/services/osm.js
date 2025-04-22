const CACHE_KEY = 'osm_restaurant_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Load cache from localStorage
const loadCache = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return new Map();
    const parsed = JSON.parse(cachedData);
    const now = Date.now();
    // Filter out expired entries, ignoring the key
    const validEntries = Object.entries(parsed).filter(([, value]) => now - value.timestamp < CACHE_EXPIRY);
    return new Map(validEntries.map(([key, value]) => [key, value.data]));
};

// Save cache to localStorage
const saveCache = (cache) => {
    const now = Date.now();
    const cacheObject = {};
    cache.forEach((value, key) => {
        cacheObject[key] = { data: value, timestamp: now };
    });
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
};

const cache = loadCache();

export const fetchNearbyRestaurants = async (lat, lng, radius = 1000) => {
    const cacheKey = `${lat}:${lng}:${radius}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        const safeRadius = Math.min(Math.max(radius, 500), 5000); // Clamp between 500m-5km

        const query = `
            [out:json][timeout:15];
            node[amenity=restaurant](around:${safeRadius},${lat},${lng});
            out tags;
            out center;
        `.replace(/\s+/g, ' ').trim();

        const response = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
            {
                signal: AbortSignal.timeout(15000) // 15s timeout
            }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const results = data.elements?.filter(element =>
            element.tags?.name && element.lat
        ).map(element => ({
            ...element,
            simulatedRating: (Math.random() * 2 + 3).toFixed(1) // Random rating 3.0-5.0
        })) || [];

        cache.set(cacheKey, results);
        saveCache(cache); // Save to localStorage
        return results;
    } catch (error) {
        console.error("OSM Query Failed:", error);
        throw new Error("Failed to fetch restaurants. Please try again later.");
    }
};

export const getAddressFromCoordinates = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'User-Agent': 'RestaurantFinderApp/1.0'
                }
            }
        );

        const data = await response.json();
        return [
            data.address?.road,
            data.address?.house_number,
            data.address?.city,
            data.address?.country
        ].filter(Boolean).join(', ') || 'Address not available';
    } catch (error) {
        console.error("Geocoding failed:", error);
        return 'Address not available';
    }
};