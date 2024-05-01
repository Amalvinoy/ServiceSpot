const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/submit-details', (req, res) => {
    const { name, email, service, location } = req.body;
    const newService = new Service({ name, email, service, location });
    newService.save()
        .then(() => {
            res.send('Details submitted successfully');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error submitting details');
        });
});
