import { Link } from 'react-router-dom';
import './Message.css';

export default function Message(props) {

    const { msg } = props;
    const { email, username, user, message, _id } = msg;

    return (
        <div className="message">
            <div className="header">
                <h1 className="title">{username}</h1>
                <h3 className="email">{email}</h3>
            </div>
            <div className="body">
                <textarea
                    user={user}
                    disabled value={message}></textarea>
            </div>
            <div className="option">
                <Link to={`${_id}/delete`} className="btn dlt">Delete</Link>
            </div>
        </div>
    )
}
