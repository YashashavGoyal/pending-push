import { Link } from "react-router-dom";
import { useAuth } from "../../utils/auth";
import "./Navbar.css";

export default function Navbar() {

    const { isLoggedIn, isLoading } = useAuth();

    if (isLoading) {
        return <h1>Loading....</h1>
    }

    return (
        <nav className="top">
            <div className="topLeft">
                <img src="" alt="logo" />
            </div>
            <div className="topCenter">
                <ul className="topList">
                    <li className="topListItem">
                        <Link to={
                            (isLoggedIn)?'/feed':"/"
                        }>HOME</Link>
                    </li>
                    <li className="topListItem">
                        <Link to='/about'>ABOUT</Link>
                    </li>
                    <li className="topListItem">
                        <Link to='/contact'>CONTACT</Link>
                    </li>
                    {
                        (isLoggedIn) ?
                            <>
                                <li className="topListItem">
                                    <Link to='/create-post'>WRITE</Link>
                                </li>
                                <li className="topListItem">
                                    <Link to='/logout'>LOGOUT</Link>
                                </li>
                            </> : ""
                    }
                </ul>
            </div>
            <div className="topRight">
                {isLoggedIn ? (
                    <>
                        <Link className="link" to="/user/admin">
                            <img
                                className="topImg"
                                src="https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                                alt=""
                            />
                        </Link>
                    </>
                ) : (
                    <ul className="topList">
                        <li className="topListItem">
                            <Link className="link" to="/login">
                                LOGIN
                            </Link>
                        </li>
                        <li className="topListItem">
                            <Link className="link" to="/register">
                                REGISTER
                            </Link>
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    );
}
