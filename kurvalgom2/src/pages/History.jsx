import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { getAllBlogPosts } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import ImageModal from '../components/ImageModal';

function History() {
    const { user } = useAuth();
    const [blogHistory, setBlogHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalImage, setModalImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogHistory = async () => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                setLoading(true);
                setError('');
                const data = await getAllBlogPosts();
                console.log('Fetched blog posts:', data); // Debug: Log the fetched data
                console.log('User ID:', user.id); // Debug: Log the user ID
                // Filter blog posts to only show the current user's posts
                const userPosts = data.filter((post) => {
                    console.log('Post user_id:', post.user_id); // Debug: Log each post's user_id
                    return post.user_id === user.id;
                });
                setBlogHistory(userPosts);
                if (userPosts.length === 0) {
                    setError('You haven’t posted any blog reviews yet.');
                }
            } catch (err) {
                setError('Failed to load blog history');
                console.error('Error fetching blog history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogHistory();
    }, [user, navigate]);

    const handleOpenModal = (imageUrl) => {
        setModalImage(imageUrl);
    };

    const handleCloseModal = () => {
        setModalImage(null);
    };

    return (
        <div className="bg-black min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-light-orange mb-8 text-center font-poppins tracking-wide">
                    Your Blog Post History
                </h1>

                {error && (
                    <div className="bg-red-900 text-white p-4 rounded-lg mb-8 max-w-3xl mx-auto">
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-light-orange"></div>
                        <p className="text-white mt-2">Loading history...</p>
                    </div>
                ) : blogHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-white text-lg">You haven’t posted any blog reviews yet.</p>
                        <p className="text-gray-400 mt-2">Share your restaurant experiences on the Blog page!</p>
                        <button
                            onClick={() => navigate('/blog')}
                            className="mt-4 bg-light-orange text-black font-medium py-2 px-6 rounded-lg hover:bg-mossy-green hover:text-white transition-colors"
                        >
                            Go to Blog
                        </button>
                    </div>
                ) : (
                    <div className="blog-posts-container max-w-7xl mx-auto">
                        <div className="blog-posts-grid">
                            {blogHistory.map((post) => (
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
                                            <p className="text-gray-700 mb-2 text-sm">{post.comment}</p>
                                            <div className="flex justify-between items-center text-xs">
                                                <p className="text-gray-500">
                                                    {new Date(post.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                                <p className="text-mossy-green font-medium">
                                                    By {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Anonymous'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {modalImage && (
                    <ImageModal imageUrl={modalImage} onClose={handleCloseModal} />
                )}
            </div>
        </div>
    );
}

export default History;