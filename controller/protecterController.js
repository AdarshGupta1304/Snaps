const util = require('util');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');


exports.protect = catchAsync(async (req,res,next) => {

    let token;
    // console.log('req.cookie: ',req.cookies);

    // 1) Get the Token and check if it exists
    if( req.cookies.jwt ) {
        token = req.cookies.jwt;
    }

    if(!token) return next(new AppError('You are not logged in! Please Log in to get the access.',401));

    // 2) Verify token
    const decoded = await util.promisify( jwt.verify)(token, process.env.JWT_SECRET) ;
    // console.log(decoded);

    // 3) Check if user is still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) return next(new AppError('The user belonging to this token does no longer exists.', 401));


    // 4) Check if user changed password after the JWT was issued
    if( currentUser.changedPasswordAfter(decoded.iat) ) {
        return next(new AppError('user recently changed password. Please Log in again!',401));
    }
    // grant access to protected route...
    // console.log('You are logged in plz proceed and upload the image!');
    req.user = currentUser;
    next();
});