import { useState, useEffect } from 'react';
import { createBlogPost, getAllBlogPosts, updateBlogPost, deleteBlogPost } from '../services/supabase';
import { useAuth } from '../App';
import { useLocation, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import ImageModal from '../components/ImageModal';

function Blog() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editComment, setEditComment] = useState('');
    const [rating, setRating] = useState(0);
    const [modalImage, setModalImage] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const selectedRestaurant = location.state?.selectedRestaurant;

    useEffect(() => {
        const fetchData = async () => {
            try {
                await loadPosts();
            } catch (_err) {
                setError('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const loadPosts = async () => {
        const blogPosts = await getAllBlogPosts();
        setPosts(blogPosts);
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

    const handleOpenModal = (imageUrl) => {
        setModalImage(imageUrl);
    };

    const handleCloseModal = () => {
        setModalImage(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (!selectedRestaurant) {
            setError('Select a restaurant from the homepage');
            return;
        }

        try {
            await createBlogPost(
                user.id,
                newImage ? imagePreview : null,
                newComment,
                rating,
                selectedRestaurant
            );
            setNewComment('');
            setNewImage(null);
            setImagePreview('');
            setRating(0);
            navigate('/blog', { replace: true, state: {} });
            await loadPosts();
        } catch (err) {
            setError(`Failed to post: ${err.message}`);
        }
    };

    const handleStartEdit = (post) => {
        if (!user) navigate('/login');
        setEditingId(post.blog_id);
        setEditComment(post.comment);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditComment('');
    };

    const handleUpdate = async (blogId) => {
        if (!user) navigate('/login');
        try {
            await updateBlogPost(blogId, { comment: editComment });
            setEditingId(null);
            setError('');
            await loadPosts();
        } catch (_err) {
            setError('Failed to update post');
        }
    };

    const handleDelete = async (blogId) => {
        if (!user) navigate('/login');
        try {
            if (window.confirm('Delete this post?')) {
                await deleteBlogPost(blogId);
                setError('');
                await loadPosts();
            }
        } catch (_err) {
            setError('Failed to delete post');
        }
    };

    return (
        <div className="bg-black min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-light-orange mb-8 text-center font-poppins tracking-wide">
                    Restaurant Reviews & Experiences
                </h1>

                {/* New Post Form */}
                {user && selectedRestaurant ? (
                    <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-lg border border-mossy-green max-w-3xl mx-auto">
                        <h2 className="text-2xl font-semibold text-light-orange mb-4 font-poppins">
                            Share Your Experience
                        </h2>

                        <div className="bg-white p-4 rounded-lg mb-4">
                            <h3 className="text-lg font-medium text-mossy-green mb-2">
                                {selectedRestaurant.tags?.name || 'Selected Restaurant'}
                            </h3>
                            <p className="text-gray-600">{selectedRestaurant.address || 'No address available'}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-white text-lg mb-2">Upload a Photo</label>
                                <div
                                    className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-light-orange transition-colors"
                                    onDrop={handleImageDrop}
                                    onDragOver={handleDragOver}
                                >
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded" />
                                            <button
                                                type="button"
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                onClick={() => {
                                                    setNewImage(null);
                                                    setImagePreview('');
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400">
                                            <p>Drag & drop image here, or click to select</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={handleImageChange}
                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white text-lg mb-2">Your Rating</label>
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <StarRating rating={rating} setRating={setRating} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white text-lg mb-2">Your Review</label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Share your thoughts about this restaurant..."
                                    required
                                    className="w-full p-4 border rounded-lg bg-gray-800 text-white border-gray-700 focus:border-light-orange focus:ring-1 focus:ring-light-orange"
                                    rows="4"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-light-orange text-black text-lg font-bold py-3 px-6 rounded-lg hover:bg-mossy-green hover:text-white transition-colors duration-300"
                            >
                                Post Review
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="text-center mb-8">
                        {user ? (
                            <div className="bg-gray-900 rounded-xl p-6 max-w-lg mx-auto">
                                <p className="text-white mb-4">To share your experience, first select a restaurant from the homepage</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-light-orange text-black font-medium py-2 px-6 rounded-lg hover:bg-mossy-green hover:text-white transition-colors"
                                >
                                    Find a Restaurant
                                </button>
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-xl p-6 max-w-lg mx-auto">
                                <p className="text-white mb-4">Log in to share your own restaurant experiences</p>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="bg-light-orange text-black font-medium py-2 px-6 rounded-lg hover:bg-mossy-green hover:text-white transition-colors"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="bg-gray-700 text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-900 text-white p-4 rounded-lg mb-8 max-w-3xl mx-auto">
                        <p>{error}</p>
                    </div>
                )}

                {/* Posts Display */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-light-orange"></div>
                        <p className="text-white mt-2">Loading posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white text-lg">No restaurant reviews yet.</p>
                        <p className="text-gray-400 mt-2">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6 justify-items-center">
                        {posts.map((post) => (
                            <div key={post.blog_id} className="blog-post-card bg-white rounded-xl overflow-hidden">
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt="Blog post"
                                        className="blog-image cursor-pointer"
                                        onClick={() => handleOpenModal(post.image)}
                                    />
                                )}

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-mossy-green truncate">
                                            {post.restaurant?.tags?.name || 'Restaurant'}
                                        </h3>
                                        <div className="text-light-orange text-sm">
                                            {post.rating ? '★'.repeat(post.rating) + '☆'.repeat(5 - post.rating) : '☆☆☆☆☆'}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-2">
                                        {editingId === post.blog_id ? (
                                            <div className="edit-form mb-2">
                                                <textarea
                                                    value={editComment}
                                                    onChange={(e) => setEditComment(e.target.value)}
                                                    className="w-full p-2 border rounded-lg mb-2 border-gray-300 focus:border-light-orange text-sm"
                                                    rows="3"
                                                />
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleUpdate(post.blog_id)}
                                                        className="bg-mossy-green text-white py-1 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="bg-gray-300 text-gray-800 py-1 px-3 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 mb-2 text-sm">{post.comment}</p>
                                        )}

                                        <div className="flex justify-between items-center text-xs">
                                            <p className="text-gray-500">
                                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-mossy-green font-medium">By {post.username}</p>
                                        </div>
                                    </div>

                                    {user && user.id === post.user_id && (
                                        <div className="mt-3 flex space-x-2 justify-end border-t border-gray-100 pt-2">
                                            {editingId !== post.blog_id && (
                                                <button
                                                    onClick={() => handleStartEdit(post)}
                                                    className="bg-gray-200 text-gray-800 py-1 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(post.blog_id)}
                                                className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {modalImage && (
                    <ImageModal imageUrl={modalImage} onClose={handleCloseModal} />
                )}
            </div>
        </div>
    );
}

export default Blog;