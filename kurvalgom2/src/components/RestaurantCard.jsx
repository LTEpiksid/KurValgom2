import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RestaurantCard({ restaurant }) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/blog', { state: { selectedRestaurant: restaurant } });
    };

    return (
        <div
            className="restaurant-card p-4 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <h3 className="text-lg font-semibold text-black">{restaurant?.tags?.name || 'Restaurant'}</h3>
            {isHovered && (
                <div className="info-overlay bg-mossy-green bg-opacity-80 text-white p-2 rounded-lg">
                    <p>{restaurant?.tags?.vicinity || 'No address'}</p>
                    <p>Rating: {restaurant?.tags?.rating || 'N/A'}</p>
                </div>
            )}
        </div>
    );
}

export default RestaurantCard;