import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function SideNav() {

    const location = useLocation();
    const [authAdmin, setAuthAdmin] = useState(false);

    useEffect(() => {
        
        if (location.pathname.includes('/auth/admin')) {
            setAuthAdmin(true);
        } else {
            setAuthAdmin(false);
        }
    }, [location.pathname]);


    return (
        <nav>
            {
                (authAdmin)?
                <ul>
                    <li>
                        <Link to='/auth/admin' className="logo">
                            <img src="/logo.jpg" alt="" />
                            <span className="nav-item">Auth Admin</span>
                        </Link>
                    </li>
                    <li>
                        <Link to='users' className="logout">
                            <i className="fas fa-sign-out-alt"></i>
                            <span className="nav-item">Users</span>
                        </Link>
                    </li>
                    <li>
                        <Link to='posts' className="logout">
                            <i className="fas fa-sign-out-alt"></i>
                            <span className="nav-item">Posts</span>
                        </Link>
                    </li>
                    <li>
                        <Link to='profile' className="logout">
                            <i className="fas fa-sign-out-alt"></i>
                            <span className="nav-item">Profile</span>
                        </Link>
                    </li>
                    <li>
                        <Link to='..\..\logout' className="logout">
                            <i className="fas fa-sign-out-alt"></i>
                            <span className="nav-item">Log out</span>
                        </Link>
                    </li>
                </ul>
                :
                <ul>
                <li>
                    <Link to='/' className="logo">
                        <img src="/logo.jpg" alt="" />
                        <span className="nav-item">posts</span>
                    </Link>
                </li>
                <li>
                    <Link to='posts' className="logout">
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="nav-item">Posts</span>
                    </Link>
                </li>
                <li>
                    <Link to='profile' className="logout">
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="nav-item">Profile</span>
                    </Link>
                </li>
                <li>
                    <Link to='..\..\logout' className="logout">
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="nav-item">Log out</span>
                    </Link>
                </li>
            </ul>
            }
        </nav>
    )
}
