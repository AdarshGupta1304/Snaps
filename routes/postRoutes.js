const router = require('express').Router();
const post = require('./../controller/postController');
const multer = require('multer');
const protect = require('./../controller/protecterController');

const upload = multer(); 


// Routes
router.route('/')
    .get(post.getAllPosts);

router.route('/:username')
    .get(protect.protect, post.getAllMyPosts)
    .post(protect.protect, upload.single('image'), post.uploadImage);

    
// Exporting...
module.exports =  router;