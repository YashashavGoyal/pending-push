const express = require('express');

// Controllers
const { createUser, loginUser } = require('../controllers/auth-controller');

const router = express.Router();

router.route("/register").post(createUser);

router.route("/login").post(loginUser);

module.exports = router;