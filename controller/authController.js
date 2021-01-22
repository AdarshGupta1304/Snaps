const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const auth = require('./authController');
const crypto = require('crypto');




// Generating JSON Web Token
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id); 

    const cookieOption = { 
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }

    res.cookie('jwt', token, cookieOption);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
}



// Sign Up
exports.signup = catchAsync(async (req,res,next) => {

    const { username, password, confirmPassword } = req.body;
    
    // check if username and password is are provided by user or not
    if(!username || !password) return next(new AppError('Please Provide username and password !',400));
    // passwords mactching
    const isSame = password === confirmPassword;
    if(!isSame) return next(new AppError('Passwords are not the same!',401));

    // creating new user
    const newUser = await User.create({
        username: username,
        password: password, 
        confirmPassword: confirmPassword
    });

    // If user not created in DB due to some error
    if(!newUser) return next('User does not registered, Internal errors!', 500);

    newUser.loginLogs.push(Date.now());
    newUser.save({ validateBeforeSave: false });

    // Protecting password from sending it to response
    newUser.password = undefined;
    
    // Creating Web Token && sending response
    createSendToken(newUser,201,res);
});



// Login
exports.login = catchAsync(async (req,res,next) => {

    console.log(req.headers);
    const { username, password } = req.body;

    // check if username and password is are provided by user or not
    if(!username || !password) return next(new AppError('Please Provide username and password !',400));

    // find if user exist in database
    const user = await User.findOne({username: username}).select('+password');

    // verify password of the user if it is correct
    if(!user || !await user.checkPassword(password, user.password)) {
        return next(new AppError('Incorrect username or password!',401));
    }

    // Add login activity into the database
    user.loginLogs.push(Date.now());
    user.save({ validateBeforeSave: false });

    // Creating Web Token && sending response
    createSendToken(user, 201, res);
});


// Logout
exports.logout = catchAsync(async (req,res,next) => {
    
    console.log('username : ',req.body.username);
    const user = await User.findOne({username: req.body.username});

    if(!user) return next(new AppError('User does not found!',404));

    user.logoutLogs.push(Date.now());
    user.save({ validateBeforeSave: false });
    
    token = null;
    
    // createSendToken(token, 201, res);
    const cookieOption = { 
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }
    res.cookie('jwt', token, cookieOption)
    // sending response
    return res.status(201).json({
        status: "success",
        token,
        message: "successfully logged out!"
    });
});

// Forget password
exports.forgotPassword = catchAsync(async (req,res,next) => {
    // 1) Get the user based on POSTed username
    const user = await User.findOne({username: req.body.username});

    if(!user) return next(new AppError('There is no user with that username',404));

    // 2) Generate the random reset Token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) send the reset-token to the client
    res.status(200).json({
        status: 'success',
        resetToken
    }) 

});


exports.resetPassword = catchAsync(async (req,res,next) => {
    // 1) Get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
            passwordResetToken: hashedToken, 
            passwordResetExpires: { $gt: Date.now() } 
        }).select('+password');

    // 2) if token has not expired, and there is user, set the new password
    if(!user) return next(new AppError('Token is invalid or has expired!', 400));


    // 3) update changePasswordAt property for the user
       user.password = req.body.password;
       user.confirmPassword = req.body.confirmPassword;
       user.passwordResetToken = undefined;
       user.passwordResetExpires = undefined; 
       await user.save();

       const token = await signToken(user._id);

    // 4) Log the user in, send JWT
    res.status(200).json({
        status: 'success',
        token
    })
});
