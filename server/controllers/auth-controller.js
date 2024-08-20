const User = require('../models/User-model');

// Create User
const createUser = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        const userExist = await User.findOne({ email });


        if (userExist) {
            return res.status(400).json({ message: "User Already Exists" });
        }

        const user = await User.create({
            username, email, phone, password
        })

        res.status(201).json({
            message: "Account Created Successfully",
            token: user.generateToken(),
            userId: user._id,
        })

    } catch (err) {
        // res.status(500).json({ message: "Internal Server Error" });

        const error = {
            status: 500,
            message: "Internal Server Error Cannot Create User",
            discription: err,
        }
        next(error);
    }
}

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExist = await User.findOne({ email });

        if (!userExist) {
            res.status(400).json({
                message: "Invalid Credential",
            });
        }

        const isPass = await userExist.comparePass(password);

        if (isPass) {
            res.status(200).json({
                message: "Login Successfull",
                token: userExist.generateToken(),
                userId: userExist._id
            })
        }
        else {
            res.status(400).json({
                message: "Invalid Credential",
            });
        }

    } catch (err) {
        // res.status(500).json({message: "Internal Server Error"})

        const error = {
            status: 500,
            message: "Internal Server Error Cannot Login User",
            discription: err,
        }
        next(error);
    }
}

// Update User
const updateUser = async (req, res) => {
    try {
        const id = req.userId;
        const updateUser = req.body;

        // Validate the updateUser object to avoid updating restricted fields
        if (Object.keys(updateUser).length === 0) {
            return res.status(400).json({
                message: "No data provided for update"
            });
        }

        const user = await User.findByIdAndUpdate(id, updateUser, { new: true });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            message: "Internal Server Error Can't Update User",
        })
    }
}

// Getting User Info
const getUser = async (req, res) => {
    try {
        const id = req.userId;
        const userData = await User.findOne({ _id: id }, { password: 0 });

        if (!userData) {
            return res.status(404)
                .json({ message: "User Not Found " });
        }

        return res.status(200).json({
            message: "User Data Fetched Succesfully",
            user: userData,
        })

    } catch (err) {
        // console.log(error);
        // return res.status(500)
        //     .json({ message: "Internal Serrver Error Can't Get User Info" });

        const error = {
            status: 500,
            message: "Internal Serrver Error Can't Get User Info",
            discription: err,
        }
        next(error);
    }
}

const getUserPostEach = async (req, res) => {
    try {
        const id = req.userId;
        const user = await User.findById(id).populate('posts');

        if (!user) {
            return res.status(404)
                .json({ message: 'User Not Found' })
        }

        const posts = await user.posts;

        return res.status(200)
            .json({
                message: "Post Fetched Succeessfully",
                posts,
            });
    } catch (err) {
        // console.error('User Post', error);
        // res.status(500)
        //     .json({ message: `Internal Server Error Post Cannot Fetched` })

        const error = {
            status: 500,
            message: `Internal Server Error Post Cannot Fetched`,
            discription: err,
        }
        next(error);
    }
}

module.exports = {
    createUser,
    loginUser,
    updateUser,
    getUser,
    getUserPostEach,
};