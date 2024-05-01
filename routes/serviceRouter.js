const express = require('express');
const router = express.Router();
const Service = require('../models/serviceModels');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Define routes
router.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

router.post('/submit-details', (req, res) => {
    const { name, phone, service, location } = req.body;
    const newService = new Service({ name, phone, service, location });
    newService.save()
        .then(() => {
            res.send('Details submitted successfully');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error submitting details');
        });
});


module.exports = router;
