export const fetchNearbyRestaurants = async (lat, lng, radius = 1000) => {
    try {
        const safeRadius = Math.min(Math.max(radius, 500), 20000); // Clamp between 500m-20km

        const query = `
            [out:json][timeout:25];
            (
                node[amenity=restaurant](around:${safeRadius},${lat},${lng});
                way[amenity=restaurant](around:${safeRadius},${lat},${lng});
                relation[amenity=restaurant](around:${safeRadius},${lat},${lng});
            );
            out body;
            >;
            out skel qt;
        `.replace(/\s+/g, ' ').trim();

        const response = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
            {
                signal: AbortSignal.timeout(30000) // 30s timeout
            }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        return data.elements?.filter(element =>
            element.tags?.name && (element.lat || element.center?.lat)
        ) || [];

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