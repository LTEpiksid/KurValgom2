import { useState, useEffect } from 'react';
import { createBlogPost, getAllBlogPosts, updateBlogPost, deleteBlogPost } from '../services/indexedDB';
import { getCurrentUser } from '../services/auth';
import RestaurantCard from '../components/RestaurantCard';
import { useLocation, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import ImageModal from '../components/ImageModal';

function Blog() {
    const [posts, setPosts] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editComment, setEditComment] = useState('');
    const [rating, setRating] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const currentUser = getCurrentUser();
    const location = useLocation();
    const navigate = useNavigate();
    const selectedRestaurant = location.state?.selectedRestaurant;

    // Load all blog posts on component mount
    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const blogPosts = await getAllBlogPosts();
            setPosts(blogPosts);
        } catch (err) {
            console.error('Error loading posts:', err);
            setError('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            setNewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setError('You must be logged in to create a post');
            return;
        }

        if (!selectedRestaurant) {
            setError('Please select a restaurant from the homepage first');
            return;
        }

        try {
            // Convert image to base64 if it exists
            let imageData = null;
            if (newImage) {
                imageData = imagePreview; // Already converted to base64 in handleImageChange
            }

            await createBlogPost(
                currentUser.UserID,
                imageData,
                newComment,
                rating,
                selectedRestaurant
            );

            setNewComment('');
            setNewImage(null);
            setImagePreview('');
            setRating(0);

            // Clear the selected restaurant from location state
            navigate('/blog', { replace: true, state: {} });

            await loadPosts(); // Reload posts after creating a new one
        } catch (err) {
            console.error('Error creating post:', err);
            setError('Failed to create post');
        }
    };

    const handleStartEdit = (post) => {
        // Check if current user is the post's owner
        if (currentUser?.UserID !== post.UserID) {
            setError("You can only edit your own posts");
            return;
        }

        setEditingId(post.BlogID);
        setEditComment(post.comment);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditComment('');
    };

    const handleUpdate = async (blogId) => {
        try {
            // Get the post to verify ownership
            const postToUpdate = posts.find(post => post.BlogID === blogId);

            if (!postToUpdate || currentUser?.UserID !== postToUpdate.UserID) {
                setError("You can only update your own posts");
                return;
            }

            await updateBlogPost(blogId, { comment: editComment });
            setEditingId(null);
            setError(''); // Clear any previous errors
            await loadPosts(); // Reload posts after update
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Failed to update post');
        }
    };

    const handleDelete = async (blogId) => {
        try {
            // Get the post to verify ownership
            const postToDelete = posts.find(post => post.BlogID === blogId);

            if (!postToDelete || currentUser?.UserID !== postToDelete.UserID) {
                setError("You can only delete your own posts");
                return;
            }

            if (window.confirm('Are you sure you want to delete this post?')) {
                await deleteBlogPost(blogId);
                setError(''); // Clear any previous errors
                await loadPosts(); // Reload posts after deletion
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            setError('Failed to delete post');
        }
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowModal(true);
    };

    const closeImageModal = () => {
        setShowModal(false);
        setSelectedImage(null);
    };

    return (
        <div className="page-container">
            <div className="container blog-page">
                <h1>Restaurant Blog Posts</h1>

                {currentUser && selectedRestaurant ? (
                    <div className="create-post">
                        <h3>Create New Post</h3>
                        <div className="selected-restaurant">
                            <h4>Selected Restaurant:</h4>
                            <div className="restaurant-preview">
                                <RestaurantCard restaurant={selectedRestaurant} />
                            </div>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Upload Image</label>
                                <div
                                    className="image-drop-area"
                                    onDrop={handleImageDrop}
                                    onDragOver={handleDragOver}
                                >
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="image-preview"
                                        />
                                    ) : (
                                        <p>Drag & drop an image here, or click to select</p>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/png"
                                        onChange={handleImageChange}
                                        className="file-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Your Rating</label>
                                <StarRating rating={rating} setRating={setRating} />
                            </div>
                            <div className="form-group">
                                <label>Your Review</label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write your review here"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Post Review</button>
                        </form>
                    </div>
                ) : currentUser ? (
                    <div className="restaurant-selection-prompt">
                        <p>Please go to the homepage and select a restaurant first</p>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Go to Homepage
                        </button>
                    </div>
                ) : (
                    <div className="login-prompt">
                        <p>Please login to post restaurant reviews</p>
                        <button onClick={() => navigate('/login')} className="btn btn-primary">
                            Login
                        </button>
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                {loading ? (
                    <div className="loading">
                        <p>Loading posts...</p>
                    </div>
                ) : (
                    <div className="blog-posts">
                        {posts.length === 0 ? (
                            <div className="no-posts">
                                <p>No posts yet. Be the first to create one!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.BlogID} className="blog-post-card">
                                    <div className="post-header">
                                        <h3>{post.restaurant?.tags?.name || 'Restaurant'}</h3>
                                        <div className="post-rating">
                                            {post.rating && (
                                                <div className="stars">
                                                    {'★'.repeat(post.rating)}
                                                    {'☆'.repeat(5 - post.rating)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {post.Image && (
                                        <div
                                            className="post-image-container"
                                            onClick={() => openImageModal(post.Image)}
                                        >
                                            <img src={post.Image} alt="Blog post" className="post-image" />
                                        </div>
                                    )}

                                    <div className="post-content">
                                        {editingId === post.BlogID ? (
                                            <div className="edit-form">
                                                <textarea
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                />
                                                <div className="edit-actions">
                                                    <button onClick={() => handleUpdate(post.BlogID)} className="btn btn-primary">
                                                        Save
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="btn btn-secondary">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="post-comment">{post.comment}</p>
                                                <p className="post-date">
                                                    {new Date(post.date).toLocaleString()}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {currentUser && currentUser.UserID === post.UserID && (
                                        <div className="post-actions">
                                            {editingId !== post.BlogID && (
                                                <button onClick={() => handleStartEdit(post)} className="btn btn-secondary">
                                                    Edit
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(post.BlogID)} className="btn btn-danger">
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Image Modal */}
                {showModal && (
                    <div className="image-modal" onClick={closeImageModal}>
                        <img src={selectedImage} alt="Enlarged" className="enlarged-image" />
                        <button className="image-modal-close" onClick={closeImageModal}>×</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Blog;