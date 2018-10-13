const express = require('express')
const expressValidator = require('express-validator');
const app = express()
const bodyParser = require("body-parser");
const port = 8080

const global = require('./utilities/globals');

let BITBOXSDK = require('bitbox-sdk/lib/bitbox-sdk').default;
let BITBOX = new BITBOXSDK();

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

let mainnetSocket = new BITBOX.Socket({callback: () => {console.log('connected')}, restURL: 'https://rest.bitcoin.com'})
mainnetSocket.listen('transactions', (message) => {
  
});

let testnetSocket = new BITBOX.Socket({callback: () => {console.log('connected')}, restURL: 'https://trest.bitcoin.com'})
mainnetSocket.listen('transactions', (message) => {
  
});