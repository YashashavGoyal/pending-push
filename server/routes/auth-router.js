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

const router = express.Router();

router.route("/register").post(createUser);

router.route("/login").post(loginUser);

router.route('/user/update').patch(authmiddleware, updateUser);

router.route('/user/info').get(authmiddleware, getUser);

router.route('/user/post').get(authmiddleware, getUserPostEach);

module.exports = router;