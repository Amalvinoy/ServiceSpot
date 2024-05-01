const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();



// Create schema
const serviceSchema = new mongoose.Schema({
    name: String,
    phone: String,
    service: String,
    location: String
});

// Create model
const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
