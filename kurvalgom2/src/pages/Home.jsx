import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchNearbyRestaurants, getAddressFromCoordinates } from '../services/osm';
import { useAuth } from '../App';
import useGeolocation from '../hooks/useGeolocation';
import RestaurantMap from '../components/RestaurantMap';
import { addToHistory } from '../services/supabase';
import '../styles/global.css';

export default function Home() {
    const { lat, lng } = useGeolocation();
    const { user } = useAuth();
    const [randomRestaurant, setRandomRestaurant] = useState(null);
    const [radius, setRadius] = useState(1000);
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

            const restaurant = {
                ...selected,
                address
            };

            setRandomRestaurant(restaurant);

            if (user) {
                await addToHistory(user.id, restaurant.id, restaurant);
            }
        } catch (err) {
            setError("Failed to load restaurants. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlogSelection = () => {
        navigate('/blog', {
            state: {
                selectedRestaurant: randomRestaurant
            }
        });
    };

    return (
        <div className="bg-black min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-light-orange mb-8 text-center font-poppins tracking-wide">
                        Find Your Next Food Adventure
                    </h1>

                    {/* Search Controls */}
                    <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-lg border border-mossy-green">
                        <h2 className="text-2xl font-semibold text-light-orange mb-4">
                            How far are you willing to go?
                        </h2>

                        <div className="mb-6">
                            <label htmlFor="radius" className="block text-light-orange mb-3 text-lg">
                                Search Radius: {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
                            </label>
                            <input
                                type="range"
                                id="radius"
                                min="500"
                                max="5000"
                                step="500"
                                value={radius}
                                onChange={handleRadiusChange}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-sm text-light-orange mt-1 opacity-70">
                                <span>500m</span>
                                <span>5km</span>
                            </div>
                        </div>

                        <button
                            onClick={pickRandomRestaurant}
                            disabled={isLoading}
                            className="w-full bg-light-orange text-black text-lg font-bold py-3 px-6 rounded-lg hover:bg-mossy-green hover:text-white transition-colors duration-300 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Searching...
                                </>
                            ) : "Find Me a Random Restaurant!"}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-900 text-white p-4 rounded-lg mb-8">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Restaurant Result */}
                    {randomRestaurant && (
                        <div className="restaurant-result mb-8">
                            <div className="bg-gray-900 rounded-t-xl p-6 shadow-lg border border-mossy-green">
                                <h2 className="text-3xl font-bold text-light-orange mb-4 font-poppins">
                                    {randomRestaurant.tags?.name || 'Restaurant'}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-light-orange mb-2">Details</h3>
                                        <ul className="space-y-2 text-white">
                                            <li className="flex flex-col sm:flex-row sm:items-start">
                                                <span className="font-medium text-light-orange mr-2">Address:</span>
                                                <span>{randomRestaurant.address || 'Not available'}</span>
                                            </li>
                                            <li className="flex flex-col sm:flex-row sm:items-start">
                                                <span className="font-medium text-light-orange mr-2">Phone:</span>
                                                <span>{randomRestaurant.tags?.phone || 'Not available'}</span>
                                            </li>
                                            <li className="flex flex-col sm:flex-row sm:items-start">
                                                <span className="font-medium text-light-orange mr-2">Cuisine:</span>
                                                <span>{randomRestaurant.tags?.cuisine || 'Not specified'}</span>
                                            </li>
                                            <li className="flex flex-col sm:flex-row sm:items-start">
                                                <span className="font-medium text-light-orange mr-2">Website:</span>
                                                {randomRestaurant.tags?.website ? (
                                                    <a
                                                        href={randomRestaurant.tags.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-light-orange hover:underline"
                                                    >
                                                        Visit website
                                                    </a>
                                                ) : (
                                                    <span>Not available</span>
                                                )}
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-gray-800 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-light-orange mb-2">Additional Info</h3>
                                        <ul className="space-y-2 text-white">
                                            <li className="flex flex-col sm:flex-row sm:items-start">
                                                <span className="font-medium text-light-orange mr-2">Opening Hours:</span>
                                                <span>{randomRestaurant.tags?.opening_hours || 'Not available'}</span>
                                            </li>
                                            <li className="flex flex-col sm:flex-row sm:items-start">
                                                <span className="font-medium text-light-orange mr-2">Wheelchair Access:</span>
                                                <span>{randomRestaurant.tags?.wheelchair === 'yes' ? 'Yes' : 'Not specified'}</span>
                                            </li>
                                            <li className="flex flex-col sm:flex-row sm:items-start">
                                                <span className="font-medium text-light-orange mr-2">Rating:</span>
                                                <span>{randomRestaurant.simulatedRating || 'Not rated'}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="restaurant-actions mt-6 flex justify-center">
                                    {user ? (
                                        <button
                                            onClick={handleBlogSelection}
                                            className="bg-light-orange text-black font-medium py-2 px-6 rounded-lg hover:bg-mossy-green hover:text-white transition-colors"
                                        >
                                            Write a Review
                                        </button>
                                    ) : (
                                        <p className="text-white">
                                            Please <Link to="/login" className="text-light-orange hover:underline">log in</Link> to write a review.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="map-container h-96 rounded-b-xl overflow-hidden border-2 border-t-0 border-mossy-green">
                                <RestaurantMap
                                    lat={parseFloat(randomRestaurant.lat)}
                                    lng={parseFloat(randomRestaurant.lon)}
                                    restaurants={[randomRestaurant]}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}