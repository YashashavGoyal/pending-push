import { useEffect, useState } from "react";
import { useAuth } from "../../utils/auth";
import { toast } from "react-toastify";
import Post from "../Post/Post";

export default function AdminPosts() {
    const { API, token } = useAuth();
    const url = `${API}/api/auth/user/post`;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true); // Add a loading state

    const getUserPosts = async () => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resData = await response.json();
            
            if (response.ok) {
                toast.success(resData.message);
                setPosts(resData.posts);
            } else {
                toast.error(resData.error);
            }
        } catch (error) {
            console.error('User Posts Error:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false); // Ensure loading is set to false after request
        }
    };

    useEffect(() => {
        getUserPosts();
        // Empty dependency array ensures this runs only once after the initial render
    }, []);

    if (loading) {
        return <h1>Loading.....</h1>;
    }

    if (posts.length === 0) {
        return <h1>No Posts Found</h1>;
    }

    return (
        <>
            {posts.map((post, index) => (
                <Post key={index} post={post} />
            ))}
        </>
    );
}
