import { Link } from "react-router-dom";
import './Post.css';

export default function Post(props) {

    const { post } = props;

    const { author, content, date, title } = post;
    const { username } = author;

    return (
        <>
            <div className="post">
                <img
                    className="postImg"
                    src=""
                    alt=""
                />
                <div className="postInfo">
                    <div className="postCats">
                        <span className="postCat">
                            <Link className="link" to="/posts?cat=Music">
                                Music
                            </Link>
                        </span>
                        <span className="postCat">
                            <Link className="link" to="/posts?cat=Music">
                                Life
                            </Link>
                        </span>
                    </div>
                    <span className="postTitle">
                        <Link to="/post/abc" className="link">
                            {title}
                        </Link>
                    </span>
                    <hr />
                    <span className="postDate">{date}</span>
                </div>
                <p className="postDesc">
                    {content}
                </p>
                <span className="postAuthor"> author : {username}</span>
            </div></>
    )
}
