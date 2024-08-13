import { Link } from "react-router-dom";

export function SideNav() {
    return (
        <nav>
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
        </nav>
    )
}
