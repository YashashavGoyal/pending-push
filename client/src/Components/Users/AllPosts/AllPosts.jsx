import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth"
import Post from "../../Post/Post";

export default function AllPosts() {

    const [allPosts, setAllPosts] = useState([]);

    const { API, token } = useAuth();
    const url = `${API}/api/admin/posts`;

    const getAllPosts = async () => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const resData = await response.json();
            if (response.ok) {
                setAllPosts(resData.posts);
            }
        } catch (error) {
            console.log('get all posts', error);
        }
    }

    useEffect(() => {
        getAllPosts();
    }, [])

    if (allPosts.length === 0) {
        return <h2>No Post Found</h2>
    }

    return (
        <div className="posts-container">
            {allPosts.map((post, index) => {
                return <Post post={post} key={index} />
            })}
        </div>
    )
}
