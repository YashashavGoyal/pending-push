const User = require("../models/User-model");
const Contact = require("../models/contact-model");
const Post = require("../models/post-model");

// Login Admin
const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404)
                .json({ message: "User Not Found" });
        }

        if (!user.isAdmin) {
            return res.status(401)
                .json({ message: "You are not an Admin" });
        }

        const isPass = await user.comparePass(password);

        if (!isPass) {
            return res.status(401)
                .json({ message: "Invalid Credential" });
        }

        return res.status(200)
            .json({
                message: "Logged In",
                token: user.generateToken(),
                user
            });

    } catch (err) {
        // console.error(error);
        // res.status(500)
        //     .json({ message: "Internal Server Error Can't Login Admin" });

        const error = {
            status: 500,
            message: "Internal Server Error Can't Login Admin",
            discription: err,
        }
        next(error);
    }
}

// Get All Users For Admin
const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ message: "Successfully Fetched Users", users });
    } catch (err) {
        // console.error(error);
        // res.status(500).json({ message: "Internal Server Error Cannot Get All Users" });

        const error = {
            status: 500,
            message: "Internal Server Error Cannot Get All Users",
            discription: err,
        }
        next(error);
    }
}

// Get Post of User For Admin
const getUserPost = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const userData = await user.populate('posts');
        const posts = await userData.posts;

        res.status(200)
            .json({
                message: "Post Fetched Succesfully",
                posts,
            })

    } catch (err) {
        // console.error(error);
        // return res.status(500)
        //     .json({ message: "Cannot Get Post For This User" });

        const error = {
            status: 500,
            message: "Cannot Get Post For This User",
            discription: err,
        }
        next(error);
    }
}

// Delete User
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        await User.deleteOne({ _id: id });

        res.status(200).json({ message: "User Deleted" });

    } catch (err) {
        // console.error(err);
        // return res.status(500)
        //     .json({ message: "Cannot Delete User Internal Server Error" });

        const error = {
            status: 500,
            message: "Cannot Delete User Internal Server Error",
            discription: err,
        }
        next(error);
    }
}

// Get All Posts For Admin
const getAdminPosts = async (req, res) => {
    try {
        const posts = await Post.find({});
        res.status(200).json({ message: "Successfully Fetched Posts", posts });
    } catch (err) {
        // console.error(error);
        // res.status(500).json({ message: "Internal Server Error Cannot Get All Posts" });

        const error = {
            status: 500,
            message: "Internal Server Error Cannot Get All Posts",
            discription: err,
        }
        next(error);
    }
}

// Get All Msg
const getAdminContacts = async (req, res) => {
    try {
        const message = await Contact.find({});
        res.status(200).json({ message: "Successfully Fetched Contacts", message });
    } catch (err) {
        // console.error(error);
        // res.status(500).json({ message: "Internal Server Error Cannot Get All Contacts" });

        const error = {
            status: 500,
            message: "Internal Server Error Cannot Get All Contacts",
            discription: err,
        }
        next(error);
    }
}

// Delete Contact By Id
const deleteMsg = async (req, res) => {
    try {
        const id = req.params.id;
        const msg = await Contact.findById(id);

        if (!msg) {
            return res.status(404).json({ message: "Message Not Found" });
        }

        await msg.deleteOne({ _id: id });

        res.status(200).json({ message: "Message Deleted" });

    } catch (err) {
        // console.error(err);
        // return res.status(500)
        //     .json({ message: "Cannot Delete Message Internal Server Error" });

        const error = {
            status: 500,
            message: "Cannot Delete Message Internal Server Error",
            discription: err,
        }
        next(error);
    }
}

module.exports = {
    adminLogin,
    getAdminUsers,
    getUserPost,
    deleteUser,
    getAdminPosts,
    getAdminContacts,
    deleteMsg,
};