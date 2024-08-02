const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})


// hashing the password
userSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password")) {
        next();
    }

    try {
        //hash the password
        const saltRound = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(user.password, saltRound);
        user.password = hashPass;
    } catch (error) {
        next(error)
    }
})

// comparing password
userSchema.methods.comparePass = async function (password) {
    return bcrypt.compare(password, this.password);
}

const User = new mongoose.model('user', userSchema);

module.exports = User;