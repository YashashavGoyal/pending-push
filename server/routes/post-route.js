const express = require('express');
const authmiddleware = require('../middleware/auth-middleware');
const { 
    createPost,
    editPost,
    deletePost 
} = require('../controllers/post-controller');

const router = express.Router();

router.route('/new').post(authmiddleware, createPost);

router.route('/:id/edit').post(authmiddleware, editPost);

router.route('/:id/delete').delete(authmiddleware, deletePost);

module.exports = router;