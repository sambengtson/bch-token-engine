const express = require('express')
const expressValidator = require('express-validator');
const app = express()
const bodyParser = require("body-parser");
const port = 8080

const global = require('./utilities/globals');

/* Routes */
const price = require('./routes/prices');
const token = require('./routes/token');

const isProduction = global.isProduction();

if (isProduction) {
    app.use(express.static('www/dist'))
} else {
    app.get('/', (req, res) => res.send('BCH Token Engine'))
}

app.use(bodyParser.json());
app.use(expressValidator());


price.SetRoutes(app);
token.SetRoutes(app);

app.listen(port, () => console.log(`Listening on port ${port}!`))