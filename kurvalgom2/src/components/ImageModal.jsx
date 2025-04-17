import { useEffect } from 'react';

function ImageModal({ imageUrl, onClose }) {
    // Close modal when pressing Escape key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        // Prevent scrolling on body when modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    // Stop propagation to prevent closing when clicking on image
    const handleImageClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                animation: 'fadeIn 0.3s ease-out'
            }}
        >
            <div
                className="modal-content"
                onClick={handleImageClick}
                style={{
                    animation: 'scaleIn 0.3s ease-out'
                }}
            >
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Close image"
                >
                    ×
                </button>
                <img
                    src={imageUrl}
                    alt="Enlarged view"
                    className="modal-image"
                    loading="lazy"
                />
            </div>
        </div>
    );
}

export default ImageModal;