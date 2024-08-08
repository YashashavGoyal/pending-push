import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../../Components/Header/Header";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

const Home = () => {

    const [head, setHead] = useState("Blogs");

    const location = useLocation();
    const path = location.pathname;
    // console.log(path);


    useEffect(() => {
        if (path === '/') {
            setHead("Blogs");
        }
        else if (path === '/about') {
            setHead("About");
        }
        else if (path === '/contact') {
            setHead('Contact Us');
        }
        else if (path === '/register') {
            setHead('Register');
        }
        else if (path === '/login') {
            setHead("Login");
        }
        else if (path === '/create-post') {
            setHead(null);
        }
    }, [path])

    return (
        <>
            <Navbar />
            {
                head && <Header head={head} />
            }
            <Outlet />
            <Footer />
        </>
    )
}

export default Home;