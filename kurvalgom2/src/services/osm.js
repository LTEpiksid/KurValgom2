const cache = new Map();

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