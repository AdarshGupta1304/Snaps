const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'A user must have a username !'],
        unique: true
    },
    password:{
        type: String,
        required: [true, 'A user must have a password !'],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'A user must define confirm Password !'],
        validate: {  
            validator: function(ele) {
                return ele === this.password;
            },
            message: 'Passwords are not the same' 
        }
    },
    loginLogs: [Date],
    logoutLogs: [Date],
    uploadLogs: [Date],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});

// Encrypting the password...
userSchema.pre('save', async function(next) {

    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew ) return next();

    this.passwordChangedAt = Date.now() - 1000 ; 
    next();
});

userSchema.methods.checkPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changePassword = function(password){
    this.password = password;
    return ;
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10);
        // console.log(this.passwordChangedAt, JWTTimestamp);
        return changedTimestamp < JWTTimestamp ;
    }
    return false;
}

// creating reset token to send to reset passsword
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 ;
    return resetToken;
}

module.exports = mongoose.model('User',userSchema);