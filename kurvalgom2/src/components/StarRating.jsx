import { useState } from 'react';

function StarRating({ rating, setRating }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="star-rating">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;

                return (
                    <span
                        key={index}
                        className={`star ${ratingValue <= (hover || rating) ? 'filled' : 'empty'}`}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        {ratingValue <= (hover || rating) ? '★' : '☆'}
                    </span>
                );
            })}
            <span className="rating-text">{rating > 0 ? `${rating}/5` : "No rating"}</span>
        </div>
    );
}

export default StarRating;