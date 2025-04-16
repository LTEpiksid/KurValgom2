// src/components/RestaurantCard.jsx
export default function RestaurantCard({ restaurant }) {
    return (
        <div className="restaurant-card">
            <h2>{restaurant.tags?.name || 'Unnamed Restaurant'}</h2>
            <p>📍 {restaurant.address}</p>
            {restaurant.tags?.cuisine && (
                <p>🍽️ Cuisine: {restaurant.tags.cuisine}</p>
            )}
            {restaurant.tags?.phone && (
                <p>📞 {restaurant.tags.phone}</p>
            )}
        </div>
    );
}