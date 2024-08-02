const express = require('express');

// Controllers
const { createUser } = require('../controllers/auth-controller');

const router = express.Router();

router.route("/register").post(createUser);

module.exports = router;