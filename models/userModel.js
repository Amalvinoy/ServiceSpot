const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new mongoose.Schema({
    username: String,
    googleId: String,
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    otp: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {
    timestamps: true,
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = User;