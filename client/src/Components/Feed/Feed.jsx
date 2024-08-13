import { useEffect, useState } from 'react';
import { useAuth } from '../../utils/auth';
import Post from '../Post/Post';
import './Feed.css';
import { toast } from 'react-toastify';

export default function Feed() {

    const { posts, hasMore, pageNum, setPageNum } = useAuth();

    console.log(posts);
    if (!posts) {
        return <h1>Loading....</h1>
    }

    return (
        <>
            <section className='feed'>
                <div className="posts">

                    {
                        posts.map((post, index) => {
                            return (
                                <Post post={post} key={index} />
                            )
                        })
                    }
                </div>
            </section>


            <div className="foot-num">
                <button
                    className="prev btn"
                    disabled={pageNum === 1}
                    onClick={() => setPageNum(pageNum - 1)}
                >prev</button>
                <button className="page btn">{pageNum}</button>
                <button
                    className="next btn"
                    disabled={!hasMore}
                    onClick={() => setPageNum(pageNum + 1)}
                >next</button>
            </div>
        </>
    )
}
