const express = require('express');
const app = express();
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const globalErrorHandler = require('./controller/errorController');

// Development Middlewares
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Common Middlewares

app.use(express.json());

// Routers
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);


// Invalid Path tackling middlewares
app.all('*', (req,res,next) => {
    console.log('error being logged!...');
    res.status(404).json({
        status: 'fail',
        message: `the requested URL ${req.originalUrl} does not exist !`,
    });
});

app.use(globalErrorHandler);


module.exports = app;