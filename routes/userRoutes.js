const router = require('express').Router();
const auth = require('./../controller/authController');



router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.get('/logout', auth.logout);
router.post('/forgotPassword', auth.forgotPassword);
router.post('/resetPassword/:token', auth.resetPassword);

// router.get('/getMyLogs',user.getMyLogs);

module.exports = router;