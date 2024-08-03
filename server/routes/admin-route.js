const express = require('express');
// middleware
const authmiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
// Controllers
const {
    adminLogin,
    getAdminUsers,
    getUserPost
} = require('../controllers/admin-controller');

const router = express.Router();

router.route('/login').post(adminLogin);

router.route('/users').get(authmiddleware, adminMiddleware, getAdminUsers);

router.route('/:id/posts').get(authmiddleware, adminMiddleware, getUserPost);


module.exports = router;