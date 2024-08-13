import { Outlet } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import Navbar from "../../Components/Navbar/Navbar";

import './Admin.css';
import { SideNav } from "../../Components/AdminSideNav/SideNav";

const Admin = () => {
    return (
        <>
            <Navbar />
            <div className="container">
                <SideNav />
                <div className="main">
                    <Outlet />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Admin;