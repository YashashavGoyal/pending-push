import CreatePost from '../CreatePost/CreatePost';
import Post from '../Post/Post';
import './Feed.css';

export default function Feed() {
    return (
        <section className='feed'>
            <div className="posts">
                <Post />
                <Post />
                <Post />
                <Post />
                <Post />
                <Post />
                <Post />
            </div>
        </section>
    )
}
