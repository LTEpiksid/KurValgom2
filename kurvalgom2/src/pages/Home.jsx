import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNearbyRestaurants, getAddressFromCoordinates } from '../services/osm';
import useGeolocation from '../hooks/useGeolocation';
import RestaurantMap from '../components/RestaurantMap';
import RestaurantCard from '../components/RestaurantCard';
import '../styles/global.css';

export default function Home() {
    const { lat, lng } = useGeolocation();
    const [randomRestaurant, setRandomRestaurant] = useState(null);
    const [radius, setRadius] = useState(1000); // Default 1km
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRadiusChange = (e) => {
        setRadius(parseInt(e.target.value));
    };

    const pickRandomRestaurant = async () => {
        if (!lat || !lng) {
            setError("Please enable location services");
            return;
        }

        setIsLoading(true);
        setError(null);
        setRandomRestaurant(null);

        try {
            const data = await fetchNearbyRestaurants(lat, lng, radius);

            if (data.length === 0) {
                setError("No restaurants found. Try increasing the radius.");
                return;
            }

            const randomIndex = Math.floor(Math.random() * data.length);
            const selected = data[randomIndex];

            const address = selected.tags?.addr_street ||
                await getAddressFromCoordinates(selected.lat, selected.lon);

            setRandomRestaurant({
                ...selected,
                address
            });

        } catch (err) {
            setError("Failed to load restaurants. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlogSelection = () => {
        // Navigate to the blog page with the selected restaurant
        navigate('/blog', {
            state: {
                selectedRestaurant: randomRestaurant
            }
        });
    };

    return (
        <div className="home-page dark-theme">
            <h1>Find a Random Restaurant</h1>

            <div className="controls">
                <div className="radius-slider">
                    <label htmlFor="radius">
                        Search Radius: {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
                    </label>
                    <input
                        type="range"
                        id="radius"
                        min="500"
                        max="20000"
                        step="500"
                        value={radius}
                        onChange={handleRadiusChange}
                        className="slider"
                    />
                    <div className="slider-labels">
                        <span>500m</span>
                        <span>20km</span>
                    </div>
                </div>

                <button
                    onClick={pickRandomRestaurant}
                    disabled={isLoading || !lat || !lng}
                    className="action-btn"
                >
                    {isLoading ? "Searching..." : "Pick Random Restaurant"}
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {randomRestaurant && (
                <div className="restaurant-result">
                    <RestaurantCard restaurant={randomRestaurant} />

                    <div className="restaurant-actions">
                        <button
                            onClick={handleBlogSelection}
                            className="action-btn"
                        >
                            Write Review for This Restaurant
                        </button>
                    </div>

                    <RestaurantMap
                        lat={randomRestaurant.lat}
                        lng={randomRestaurant.lon}
                        restaurants={[randomRestaurant]}
                    />
                </div>
            )}
        </div>
    );
}