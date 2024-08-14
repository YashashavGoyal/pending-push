const User = require("../models/User-model");

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

    } catch (error) {
        // console.error(error);
        res.status(500)
            .json({ message: "Internal Server Error Can't Login Admin" });
    }
}

// Get All Users For Admin
const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ message: "Successfully Fetched Users", users });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: "Internal Server Error Cannot Get All Users" });
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

    } catch (error) {
        // console.error(error);
        return res.status(500)
            .json({ message: "Cannot Get Post For This User" });
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

        await User.deleteOne({_id:id});

        res.status(200).json({message: "User Deleted"});

    } catch (error) {
        console.error(error);
        return res.status(500)
            .json({ message: "Cannot Delete User Internal Server Error" });
    }
}


module.exports = { adminLogin, getAdminUsers, getUserPost, deleteUser };