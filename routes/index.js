var express = require('express');
var router = express.Router();
const Service = require('../models/serviceModels')

const authCheck = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/login')
  }
  else{
    next()
  }
}

const authheck = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/home')
  }
  else{
    next()
  }
}

const autheck = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/service')
  }
  else{
    next()
  }
}

const autheik = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/contact')
  }
  else{
    next()
  }
}

const autcheck = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/about')
  }
  else{
    next()
  }
}

const auheck = (req, res, next) => {
  if(!req.user){
    res.redirect('/auth/about')
  }
  else{
    next()
  }
}

router.get('/', authCheck, function(req, res, next) {
  res.render('home');
});

router.get('/home', authheck, function(req, res, next) {
  res.render('home');
});


router.get('/about', authCheck, function(req, res, next) {
  res.render('about');
});

router.get('/contact', autheik , function(req, res, next) {
  res.render('contact');
});

router.get('/userservice', auheck, function(req, res, next) {
  res.render('userservice');
});

router.get('/service', autheck, async function(req, res, next) {
  try {
    const serviceProviders = await Service.find();
    res.render('service', { serviceProviders });
} catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
});

module.exports = router;