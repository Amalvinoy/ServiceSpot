const asyncHandler = require("express-async-handler");
const async = require('async');
const User = require("../models/userModel");
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv").config();
const session = require('express-session');

const renderDashboard = asyncHandler(async (req, res) => {
   if(req.session.loggedIn){
    console.log('hi');
    res.render('home');
   }
    else{
      res.redirect('/auth/login');
    }
});


const logoutUser = asyncHandler(async (req, res) => {
  req.logOut(function(err) {
    if (err) { return next(err); }
    req.session.loggedIn = false; 
    res.redirect('/auth/login'); 
  });
});


const tempUserData = {};


const registerUserWithOTP = asyncHandler(async (req, res) => {
  const otp = generateOTP();

  tempUserData[req.body.email] = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    otp: otp,
  };

  try {
    await sendOTPEmail(req.body.email, otp);
    res.render('otpReg.ejs', { email: req.body.email });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Registration failed' });
  }
});


const verifyOtp = asyncHandler(async (req, res) => {
  const userEmail = req.body.email;
  const enteredOTP = req.body.otp;

  try {
    const tempUser = tempUserData[userEmail];

    if (tempUser) {
      if (enteredOTP === tempUser.otp) {
        const newUser = new User({
          username: tempUser.username,
          email: tempUser.email,
          password: tempUser.password,
        });

        User.register(newUser, newUser.password, async (err, user) => {
          if (err) {
            console.error(err);
            return res.status(400).json({ message: 'Registration failed' });
          }

          delete tempUserData[userEmail];

          req.login(user, (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Internal Server Error");
            }

            return res.redirect('/profile/');
          });
        });
      } else {
        res.status(400).json({ message: 'Invalid OTP. Please try again.' });
      }
    } else {
      res.status(400).json({ message: 'Username is already taken. Please choose another.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


async function sendOTPEmail(email, otp) {
  console.log(`Sending OTP ${otp} to ${email}`);
  const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.MYEMAIL,
      pass: process.env.APP_PASSWORD, 
    }
  });

  const mailOptions = {
    from: process.env.MYEMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};


const loginUser = asyncHandler(async (req, res) => {
  try {
    const username = req.body.username;
    const user = await User.findOne({ username });
    if (user) {
      // Log in the user using req.login()
      req.login(user, (err) => {
        if (err) {
          console.error('Error logging in:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        console.log('User logged in:', user);
        res.redirect('/profile'); // Redirect to the profile page after successful login
      });
    } else {
      console.log('No user found with this username:', username);
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error finding user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


const resetPassword = asyncHandler(async (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
              if (err) {
                return done(err);
              }
              var token = buf.toString('hex');
              done(null, token);
              console.log(token);
            });
      },
      async function findUserAndUpdateToken(token) {
          const user = await User.findOne({ email: req.body.email });
          if (!user) {
            console.log('error', 'No account with that email address exists.');
            return res.redirect('/users/forgot');
          }
          user.resetPasswordToken = token;
          console.log(user.resetPasswordToken);
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          console.log(user);
          console.log(user.email);
          try {
            console.log("saving..")
            await user.save();
            console.log('User saved successfully.');
            return user;
          } catch (error) {
            console.error('Error while saving user:', error);
          }
          callback(null, user);   
      },
      function(user, callback) {
        var smtpTrans = nodemailer.createTransport({
           service: 'Gmail', 
           auth: {
            user: process.env.MYEMAIL,
            pass: process.env.APP_PASSWORD,
          }
        });
        
          smtpTrans.sendMail({
            to: user.email,
            from: process.env.MYEMAIL,
            subject: 'ContactManagerWebApp',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/users/reset/' + user.resetPasswordToken + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          });
          console.log("Mail sent successfully");
          res.send("check your mail id for the password reset link");
  }
    ], function(err) {
      console.log('this err' + ' ' + err)
      res.redirect('/');
    });
  });

const changePasswordRequest = asyncHandler(async (req, res) => {
  console.log('resetting')
  const requestToken = req.params.token;
  const user = await User.findOne({ resetPasswordToken: requestToken, resetPasswordExpires: { $gt: Date.now() }});
  console.log(user);
  if (user) {
    res.render('resetPassword.ejs',{ requestToken });
  } else {
    res.status(400).send('Invalid or expired token');
  }
});

const changePassword = asyncHandler(async (req, res) => {
  async.waterfall([
    async function(callback) {
      const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
      if (!user) {
        // Handle the case when the user doesn't exist or the token has expired
        return res.status(400).send('Password reset token is invalid or has expired.');
      }

      user.password = req.body.password;
      //user.resetPasswordToken = undefined;
      //user.resetPasswordExpires = undefined;

      // Save the user with the new password
      try {
        console.log("saving..")
        await user.save();
        console.log('User saved successfully.');
        return user;
      } catch (error) {
        console.error('Error while saving user:', error);
      }
      
      // Send a confirmation email
      console.log(user);
      callback(null, user);
    },
    function(user, callback) {
      console.log(user);
      var smtpTrans = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.MYEMAIL,
          pass: process.env.APP_PASSWORD,
        }
      });

      var mailOptions = {
        to: user.email,
        from: process.env.MYEMAIL,
        subject: 'ContactManagerWebApp',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };

      smtpTrans.sendMail(mailOptions, function(err) {
        if (err) {
          console.log('Email sending error:', err);
        } else {
          console.log('Success! Your password has been changed.');
          res.send('Password changed.Please return to login page for login');
        }
      });
    }
  ], function(err) {
    if (err) {
      console.log(err);
      return res.status(500).send('An error occurred during the password change process.');
    }
  });
});


module.exports = {
                  loginUser, 
                  resetPassword, 
                  changePasswordRequest, 
                  changePassword, 
                  logoutUser, 
                  renderDashboard ,
                  registerUserWithOTP,
                  verifyOtp
                };