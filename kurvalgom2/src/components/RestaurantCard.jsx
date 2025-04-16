export default function RestaurantCard({ restaurant }) {
    const placeholderImage = "https://via.placeholder.com/300x200?text=No+Image+Available";
    const imageUrl = restaurant.tags?.image || placeholderImage;

    const renderStars = (rating) => {
        const stars = Math.round(parseFloat(rating));
        return "★".repeat(stars) + "☆".repeat(5 - stars);
    };

    return (
        <div className="restaurant-card">
            <img
                src={imageUrl}
                alt={restaurant.tags?.name || 'Restaurant'}
                className="restaurant-image"
                onError={(e) => (e.target.src = placeholderImage)}
            />
            <h2>{restaurant.tags?.name || 'Unnamed Restaurant'}</h2>
            <p>📍 {restaurant.address}</p>
            {restaurant.tags?.cuisine && (
                <p>🍽️ Cuisine: {restaurant.tags.cuisine}</p>
            )}
            {restaurant.tags?.phone && (
                <p>📞 {restaurant.tags.phone}</p>
            )}
            {restaurant.simulatedRating && (
                <p>⭐ Rating: {renderStars(restaurant.simulatedRating)} ({restaurant.simulatedRating}/5)</p>
            )}
            {restaurant.tags?.website && (
                <p>🌐 <a href={restaurant.tags.website} target="_blank" rel="noopener noreferrer">Visit Website</a></p>
            )}
            {restaurant.tags?.menu && (
                <p>📋 <a href={restaurant.tags.menu} target="_blank" rel="noopener noreferrer">View Menu</a></p>
            )}
        </div>
    );
}