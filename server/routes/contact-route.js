const express = require('express');
const { sendMsg } = require('../controllers/contact-controller');

const router = express.Router();

router.route("/send").post(sendMsg);


module.exports = router;