const User = require("../models/User-model");
const Contact = require("../models/contact-model");

const sendMsg = async (req, res, next) => {
    try {
        const { username, email, message, user } = req.body;
        const userData = User.findById(user);

        const msg = await Contact.create({
            username,
            email,
            message,
            user,
        })

        return res.status(200).json({message: "Message Sent Successfully"});

    } catch (error) {
        // console.error(error);
        res.status(500)
            .json({ message: "Internal Server Error Connot Send Message" });
    }
}

module.exports = { sendMsg };