const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv').config();
const User = require('../models/userModel');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    }).catch(err => done(err));
});


passport.use(
    new GoogleStrategy({
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
        callbackURL: 'http://localhost:3000/auth/google/redirect',
    }, (accessToken, refreshToken, profile, done) => {

        console.log('passport-callback-function-fired');

        User.findOne({ googleId: profile.id }).then((currentUser) => {
            if (currentUser) {
                console.log('user is ', currentUser);
                done(null, currentUser);
            } else {
                new User({
                    username: profile.displayName,
                    googleId: profile.id
                }).save().then((newUser) => {
                    console.log('new user saved to database');
                    done(null, newUser);
                }).catch(err => done(err));
            }
        }).catch(err => done(err));
    })
);

module.exports = router;
