class AppError extends Error{
    constructor(message,statusCode){
        super(message);

        this.statusCode = statusCode || 500 ;
        this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Internal Server Error, Come back later!';
        this.isOperational = true;
    }
}

module.exports = AppError;