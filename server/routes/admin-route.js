const express = require('express');
// middleware
const authmiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
// Controllers
const {
    adminLogin,
    getAdminUsers,
    getUserPost,
    deleteUser
} = require('../controllers/admin-controller');

const router = express.Router();

router.route('/login').post(adminLogin);

router.route('/users').get(authmiddleware, adminMiddleware, getAdminUsers);

router.route('/:id/posts').get(authmiddleware, adminMiddleware, getUserPost);

router.route('/:id/delete').delete(authmiddleware, adminMiddleware, deleteUser);


module.exports = router;