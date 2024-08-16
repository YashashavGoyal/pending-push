import { Link } from "react-router-dom";
import './Users.css'

export default function Users(props) {

    const { user } = props;
    const { username, isAdmin, email, phone, _id } = user;

    return (
        <>
            <div className="user">
                <div className="header">
                    <h1 className="title">{username}</h1>
                    <h5 className="isAdmin">{(isAdmin) ? 'Admin' : 'Not an Admin'}</h5>
                </div>
                <div className="body">
                    <div className="det">
                        <p className="email">{email}</p>
                        <p className="phone">{phone}</p>
                    </div>
                    <div className="operation">
                        <Link
                        to={`${_id}/view`}
                        className="view"
                        >View</Link>
                        <Link
                            to={(!isAdmin)?`${_id}/delete`:""}
                            className="btn"
                        >Delete</Link>
                    </div>
                </div>
            </div>
        </>
    )
}
