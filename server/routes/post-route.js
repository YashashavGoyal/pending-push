const express = require('express');
const authmiddleware = require('../middleware/auth-middleware');
const { 
    createPost,
    editPost,
    deletePost, 
    getPost,
    getPaginationPost
} = require('../controllers/post-controller');

const router = express.Router();

router.route('/new').post(authmiddleware, createPost);

router.route('/:id/edit').patch(authmiddleware, editPost);

router.route('/:id/delete').delete(authmiddleware, deletePost);

router.route('/read').get(authmiddleware, getPost);

router.route('/page/:num').get(authmiddleware, getPaginationPost);

module.exports = router;