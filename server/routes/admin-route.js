const express = require('express');
// middleware
const authmiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
// Controllers
const {
    adminLogin,
    getAdminUsers,
    getUserPost,
    deleteUser,
    getAdminPosts,
    getAdminContacts,
    deleteMsg
} = require('../controllers/admin-controller');

const router = express.Router();

router.route('/login').post(adminLogin);

router.route('/users').get(authmiddleware, adminMiddleware, getAdminUsers);

router.route('/posts').get(authmiddleware, adminMiddleware, getAdminPosts);

router.route('/contacts').get(authmiddleware, adminMiddleware, getAdminContacts);

router.route('/:id/posts').get(authmiddleware, getUserPost);

router.route('/:id/delete/user').delete(authmiddleware, adminMiddleware, deleteUser);

router.route('/:id/delete/msg').delete(authmiddleware, adminMiddleware, deleteMsg);


module.exports = router;