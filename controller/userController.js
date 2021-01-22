const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getMyLogs = catchAsync(async (req,res,next) => {

    const user = await User.findOne({username: req.body.username});

    if(!user) return next(new AppError('No user Found!, Please Enter a valid username.',404));

    res.status(201).json({
        status: 'success',
        data: {
            "Login logs": user.loginLogs,
            "Logout logs": user.logoutLogs,
            "Upload logs": user.uploadLogs
        }
    });
});