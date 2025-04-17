import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom restaurant icon
const restaurantIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

function RestaurantMap({ lat, lng, restaurants }) {
    if (!lat || !lng) return <div className="flex justify-center items-center h-full bg-gray-900 text-light-orange p-4">Map unavailable - Please enable location services</div>;

    // Ensure values are numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
        return <div className="flex justify-center items-center h-full bg-gray-900 text-light-orange p-4">Invalid map coordinates</div>;
    }

    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            className="z-10"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {restaurants.map((restaurant) => (
                <Marker
                    key={restaurant.id}
                    position={[parseFloat(restaurant.lat), parseFloat(restaurant.lon)]}
                    icon={restaurantIcon}
                >
                    <Popup className="restaurant-popup">
                        <div className="text-black">
                            <h3 className="font-semibold text-mossy-green">{restaurant.tags?.name || 'Unnamed Restaurant'}</h3>
                            <p>{restaurant.address || 'No address'}</p>
                            {restaurant.tags?.cuisine && <p><strong>Cuisine:</strong> {restaurant.tags.cuisine}</p>}
                            {restaurant.simulatedRating && <p><strong>Rating:</strong> {restaurant.simulatedRating}/5</p>}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default RestaurantMap;