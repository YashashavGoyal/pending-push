const express = require('express');

// Controllers
const {
    createUser,
    loginUser,
    updateUser,
    getUser,
    getUserPostEach
} = require('../controllers/auth-controller');
const authmiddleware = require('../middleware/auth-middleware');
const validate = require('../middleware/validators-middleware');
const { loginSchema, signupSchema } = require('../validators/auth-validator');

const router = express.Router();

router.route("/register").post(validate(signupSchema), createUser);

router.route("/login").post(validate(loginSchema), loginUser);

router.route('/user/update').patch(authmiddleware, updateUser);

router.route('/user/info').get(authmiddleware, getUser);

router.route('/user/post').get(authmiddleware, getUserPostEach);

module.exports = router;