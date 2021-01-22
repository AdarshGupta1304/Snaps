const AppError = require('./../utils/appError');



// Helper methods for errors...

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);

    const message = `Duplicate field value: ${value}. Please use another value! `;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const error = Object.values(err.error).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleCastErrorDB = () => new AppError(`Invalid ${err.path}: ${err.value}.`,400);

const handleJWTError = () => new AppError('Invalid Token. Please Log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your Token has Expired! Please Log in again.', 401);


// Global Error handling methods
const sendErrorDev = (err, res) => {
    console.log('Dev Error Logging...')
    res.status(err.statusCode).json({
        status: err.status,
        err,
        message: err.message,
    });
}

const sendErrorProd = (err, res) => {
    
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }else{
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
}

const globalErrorHandler = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    err.message = err.message || 'Internal Server Error, Come back Later!';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,res);
    }else if(process.env.NODE_ENV === 'production'){
        error = { ...err };
        
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'CastError') error = handleCastErrorDB();
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
}

module.exports = globalErrorHandler;