const express = require("express");
const Review = require('../models/userReviewModel');
const Services = require("../models/serviceModels");

const {
      loginUser, 
      resetPassword, 
      changePasswordRequest, 
      changePassword, 
      logoutUser, 
      renderDashboard,  
      verifyOtp,
      registerUserWithOTP } = require("../controllers/userController");


const router = express.Router();
const bodyParser = require("body-parser");


const path = require("path");

const app = express();

const urlencodedParser = bodyParser.urlencoded({ extended: true })

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public"));

// router.route("/").get((req,res) => {
//   try{
//     res.send('hi')
//   }
//   catch(err){
//     res.send(err);
//     }
// });

router.route("/login").get((req,res) => {
    try{
      res.render('login.ejs')
    }
    catch(err){
      res.send(err);
      }
  });

  router.route("/home").get((req,res) => {
    try{
      res.render('home.ejs')
    }
    catch(err){
      res.send(err);
      }
  });

  router.route("/service").get(async(req,res) => {
    try {
      const providers = await Services.find();
      const providersWithReviews = await Promise.all(providers.map(async (provider) => {
        const reviews = await Review.find({ providerId: provider._id });
        return { ...provider.toObject(), reviews };
      }));

      res.render('service', { providers: providersWithReviews });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/submit-review', async (req, res) => {
    try {
      const { providerId, user, comment } = req.body;
      const newReview = new Review({ providerId, user, comment });
      await newReview.save();
      res.redirect('/users/service'); // Redirect to home page or service provider details page
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

router.route("/registerUserWithOTP").get((req,res) => {
  try{
    res.render('register.ejs')
  }
  catch(err){
    res.send(err);
    }
});

router.route("/dashboard")

router.route("/forgot").get((req, res) => {
  try{
    res.render('forgot');
  }
  catch(err){
    res.send(err);
  }
})

router.route("/resetPassword").get((req, res) => {
  try{
    res.render('resetPassword');
  }
  catch(err){
    res.send(err);
  }
})

router.route("/verifyOtp").get((req, res) =>{
    const userEmail = req.query.email;
    res.render('verify-otp', { email: userEmail });
});

router.route("/logout").post(logoutUser);

router.route("/reset/:token").get(urlencodedParser,changePasswordRequest);

router.route("/login").post(urlencodedParser,loginUser);

router.route("/dashboard").get(renderDashboard);

router.route("/forgot").post(urlencodedParser,resetPassword);

router.route("/verifyOtp").post(urlencodedParser,verifyOtp);

router.route("/registerUserWithOTP").post(urlencodedParser,registerUserWithOTP)

router.route("/reset/:token").post(urlencodedParser,changePassword);



module.exports = router;