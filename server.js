const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = require('./app');
const mongoose = require('mongoose');

const DB_NAME = process.env.GLOBAL_DB ; 

mongoose.connect(DB_NAME, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
.then(con => console.log('DB connection successfully established !')).catch(err => console.log("MongoDB error: ",err));


const port =  process.env.PORT ||3000;
app.listen(port, (err) => {
    if(err) throw err;
    console.log('App is running on port: ',port);
})