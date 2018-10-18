const express = require('express')
const expressValidator = require('express-validator');
const app = express()
const bodyParser = require("body-parser");
const cors = require('cors')
const port = 8080

const global = require('./utilities/globals');
const mongo = require('./utilities/db');

let BITBOXSDK = require('bitbox-sdk/lib/bitbox-sdk').default;
let BITBOX = new BITBOXSDK();

/* Routes */
const price = require('./routes/prices');
const token = require('./routes/token');
const tokenCtrl = require('./controllers/tokens');

const isProduction = true;
//const isProduction = global.isProduction();

if (isProduction) {
    app.use(express.static('www/dist/www'))    
} else {
    app.get('/', (req, res) => res.send('BCH Token Engine'))
    app.use(cors())
}

app.use(bodyParser.json());
app.use(expressValidator());


price.SetRoutes(app);
token.SetRoutes(app);

app.listen(port, () => console.log(`Listening on port ${port}!`))

let mainnetSocket = new BITBOX.Socket({
    callback: () => {
        console.log('connected')
    },
    restURL: 'https://rest.bitcoin.com'
})
mainnetSocket.listen('transactions', (message) => {
    const tx = JSON.parse(message);
    handleTx(tx, 'mainnet');
});

let testnetSocket = new BITBOX.Socket({
    callback: () => {
        console.log('connected')
    },
    restURL: 'http://decatur.hopto.org:3003/v1/'
})
testnetSocket.listen('transactions', (message) => {
    const tx = JSON.parse(message);
    handleTx(tx, 'testnet');
});

function handleTx(tx, network) {
    for (const output of tx.outputs) {
        for (const addr of output.scriptPubKey.addresses) {
            mongo.db.collection('tokenrequests').findOne({
                    OneTimeAddr: addr,
                    Paid: false,
                    Network: network,
                    IsEnabled: true
                })
                .then(row => {
                    if (row) {
                        let bchAmount = parseFloat(row.Price);
                        let satPrice = BITBOX.BitcoinCash.toSatoshi(bchAmount);
                        if (output.satoshi >= satPrice) {
                            //continue;
                            row.PaidTx = tx.format.txid;
                            tokenCtrl.IssueFixedToken(row);
                            console.log('Token issued!');
                        }
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
}