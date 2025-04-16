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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={handleImageClick}>
                <button className="modal-close" onClick={onClose}>×</button>
                <img src={imageUrl} alt="Enlarged" className="modal-image" />
            </div>
        </div>
    );
}

export default ImageModal;