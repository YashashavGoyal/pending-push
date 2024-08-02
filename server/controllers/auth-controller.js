const User = require('../models/User-model');

const createUser = async (req, res) => {
    try {
        const {username, email, phone, password} = req.body;

        const userExist = await User.findOne({email});


        if (userExist) {
            return res.status(400).json({message: "User Already Exists"});
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

module.exports = { createUser };