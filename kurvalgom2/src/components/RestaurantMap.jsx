// src/components/RestaurantMap.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue with Vite
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
});

export default function RestaurantMap({ lat, lng, restaurants }) {
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={15}
            style={{ height: '400px', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {restaurants.map((restaurant) => (
                <Marker
                    key={restaurant.id}
                    position={[restaurant.lat, restaurant.lon]}
                    icon={DefaultIcon}
                >
                    <Popup>
                        <b>{restaurant.tags?.name || 'Unnamed Restaurant'}</b><br />
                        {restaurant.address}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}