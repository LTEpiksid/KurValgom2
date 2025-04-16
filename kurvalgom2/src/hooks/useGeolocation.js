// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

export default function useGeolocation() {
    const [location, setLocation] = useState({ lat: null, lng: null });

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.error('Geolocation error:', err)
        );
    }, []);

    return location;
}