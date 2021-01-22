const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A image must have a name!'],
    },
    postedBy: {
        type: String,
        required: [true,'username who has posted this is required!']
    },
    postedAt:{
        type: Date,
        default: Date.now
    }
});



module.exports = mongoose.model('Post',postSchema);