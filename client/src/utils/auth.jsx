import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const API = `http://127.0.0.1:2024`;

    // token state variable
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    // user state variable
    const [user, setUser] = useState({});
    
    // loading state variable
    const [isLoading, setIsLoading] = useState(true);

    // posts state variable
    const [posts, setPosts] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [hasMore, setHasMore] = useState({});

    // setting token in LS
    const setTokenInLS = (token) => {
        localStorage.setItem("token", token);
        setToken(token);
    }

    // handling logout
    const logoutUser = () => {
        setToken("");
        return localStorage.removeItem("token");
    }

    // getting user data
    const getUser = async () => {
        const url = `${API}/api/auth/user/info`;

        try {
            setIsLoading(true);
            if (token !== null) {
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });

                const resdata = await response.json();

                if (response.ok) {
                    const userData = await resdata.user;
                    // console.log(userData);
                    setUser(userData);
                    setIsLoading(false);
                }
                else {
                    setIsLoading(false);
                }
            }

        } catch (error) {
            console.log(`usr data error`, error);
        }

    }

    useEffect(() => {
        getUser();
    }, [token])

    // getting posts

    // getting posts
    const getPostsForFeed = async (pageNum) => {
        const postUrl = `${API}/api/post/page/${pageNum}`
        try {

            const response = await fetch(postUrl, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const resdata = await response.json();
            if (response.ok) {
                // console.log(resdata);
                setPosts(resdata.posts);
                setHasMore(resdata.hasMore);
            }

        } catch (error) {
            console.error('get post error', error);

        }
    }


    useEffect(() => {
        getPostsForFeed(pageNum);
        // console.log(pageNum);
        // console.log(posts);

    }, [pageNum]);

    let isLoggedIn = !!token;

    const contextContent = {
        API,
        token,
        isLoggedIn,
        user,
        posts,
        hasMore,
        pageNum,
        setPageNum,
        setTokenInLS,
        logoutUser,
    }

    return (
        <AuthContext.Provider value={contextContent}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth used outside of the Provider");
    };
    return authContextValue;
}