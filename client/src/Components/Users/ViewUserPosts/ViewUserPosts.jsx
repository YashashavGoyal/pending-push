import { useParams } from "react-router-dom";
import { useAuth } from "../../../utils/auth"
import { useEffect, useState } from "react";
import Post from "../../Post/Post";

import './ViewUserPosts.css';

export default function ViewUserPosts() {

    const { id } = useParams();
    const { API, token } = useAuth();
    const url = `${API}/api/admin/${id}/posts`;

    const [userPosts, setUserPosts] = useState([]);

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
                setUserPosts(resData.posts);
            }

        } catch (error) {
            console.log('get user posts', error);
        }
    }

    useEffect(() => {
        getUserPosts();
    }, [])

    return (
        <>
            <div className="posts-container">
                {userPosts.map((post, index) => {
                    return <Post post={post} key={index} />
                })}
            </div>
        </>
    )
}
