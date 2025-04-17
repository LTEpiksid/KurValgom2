import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { getAllBlogPosts } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

function History() {
    const { user } = useAuth();
    const [blogHistory, setBlogHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogHistory = async () => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                const data = await getAllBlogPosts();
                // Filter blog posts to only show the current user's posts
                const userPosts = data.filter((post) => post.user_id === user.id);
                setBlogHistory(userPosts);
            } catch (err) {
                setError('Failed to load blog history');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogHistory();
    }, [user, navigate]);

    return (
        <div className="page-container">
            <div className="container history-page">
                <h1 className="text-3xl font-bold text-white mb-6">Your Blog Post History</h1>
                {error && <p className="text-red-600 mb-4">{error}</p>}
                {loading ? (
                    <p className="text-white">Loading...</p>
                ) : blogHistory.length === 0 ? (
                    <p className="text-white">You haven't posted any blog reviews yet.</p>
                ) : (
                    <div className="history-items space-y-6">
                        {blogHistory.map((post) => (
                            <div key={post.blog_id} className="bg-white rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-2 p-4">
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt="Blog post"
                                        className="blog-image"
                                    />
                                )}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-mossy-green truncate">
                                            {post.restaurant?.tags?.name || 'Restaurant'}
                                        </h3>
                                        <div className="text-light-orange text-lg">
                                            {post.rating ? '★'.repeat(post.rating) + '☆'.repeat(5 - post.rating) : '☆☆☆☆☆'}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <p className="text-gray-700 mb-3">{post.comment}</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <p className="text-gray-500">
                                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                            <p className="text-mossy-green font-medium">
                                                By {user.username || 'Anonymous'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;