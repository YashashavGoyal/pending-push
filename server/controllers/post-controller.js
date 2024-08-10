const Post = require('../models/post-model');
const User = require('../models/User-model');

// Creating Post
const createPost = async (req, res, next) => {
    const { title, content } = req.body;
    const id = req.userId;

    if (!title || !content) {
        return res.status(400)
            .json({ message: "Fill All Fields Properly" });
    }

    try {

        const post = await Post.create({
            title,
            content,
            author: id,
        });

        // console.log(post._id);

        await addPostToUser(id, post._id);

        return res.status(201)
            .json({ message: "Post Created Successfully" });

    } catch (error) {
        return res.status(500)
            .json({
                message: "Internal Server Error Post Not Created",
            })
    }
}

// Adding Post Id to User Post Array
const addPostToUser = async (userId, postId) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            { $push: { posts: postId } },
            { new: true }
        );
    } catch (error) {
        console.error("Error adding post to user:", error);
    }
}

// Edit Post
const editPost = async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id;
    const userId = req.userId;
    // console.log(userId, postId);

    const editPost = {
        title, content,
    }

    try {

        const updatePost = await Post.updateOne({ _id: postId }, {
            $set: editPost,
        })

        return res.status(200)
            .json({
                message: "Post Updated Successfully",
                postData: editPost,
                userId: userId,
            })

    } catch (error) {
        res.status(500)
            .json({ message: "Internal Server Error: Post Not Updated" });
    }
}

// Deleting Post
const deletePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.userId;

    try {
        const post = await Post.findOne({ _id: postId });

        if (!post) {
            return res.status(404)
                .json({ message: "Post Not Found" });
        }

        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: "User not authorized to delete this post" });
        }

        const deletePost = await Post.deleteOne({ _id: postId });
        // console.log(deletePost);

        await removePostToUser(userId, postId);

        return res.status(200).json({
            message: "Post Deleted Successfully",
        })
    } catch (error) {
        return res.status(500)
            .json({ message: "Internal Server Error Post Not Deleted" });
    }

}

// Removing Post Id to User Post Array
const removePostToUser = async (userId, postId) => {
    await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
}

// Get Post
const getPost = async (req, res) => {
    const userId = req.userId;
    // console.log(userId);

    try {
        // Find the user by ID and populate the posts field
        const user = await User.findById(userId).populate('posts');
        const posts = await user.posts;

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (posts.length === 0) {
            return res.status(404).json({ message: "No Posts Found" });
        }

        res.status(200)
            .json({
                message: "Posts Is Refreshed",
                posts,
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error: Cannot get posts" });
    }
}

const getPaginationPost = async (req, res) => {
    const page = parseInt(req.params.num) || 1;
    const limit = parseInt(req.params.limit) || 10;

    try {
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author');

        // Get the total count of posts in the collection
        const totalPosts = await Post.countDocuments();

        // Calculate whether there are more posts to load
        const hasMore = skip + posts.length < totalPosts;

        if (posts.length === 0) {
            return res.status(404)
                .json({
                    message: "No posts found",
                });
        }

        // Send the posts and metadata as a response
        res.status(200).json({
            message: "Posts Fetched Successfully",
            posts,
            hasMore,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error. Can't Fetch Posts",
        });
    }
};

module.exports = { createPost, editPost, deletePost, getPost, getPaginationPost };