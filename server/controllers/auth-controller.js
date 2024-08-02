const User = require('../models/User-model');

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
            userId: user._id,
        })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userExist = await User.findOne({ email });

        if (!userExist) {
            res.status(400).json({
                message: "Invalid Credential",
            });
        }

        if (userExist.password === password) {
            res.status(200).json({
                message: "Login Successfull",
            })
        }

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        })
    }
}

module.exports = { createUser, loginUser };