const {
    body
} = require('express-validator/check')
const mongo = require('../utilities/db')

const {
    FixedToken, FixedTokenResponse
} = require('../models/tokens')

const price = require('../controllers/price');
const global = require('../utilities/globals');
const BITBOXSDK = require('bitbox-sdk/lib/bitbox-sdk').default;
const BITBOX = new BITBOXSDK();
const uuidv4 = require('uuid/v4');


module.exports.SetRoutes = (app) => {

    app.post('/token/fixed', async (req, res) => {
        try {

            const errors = validateToken(req);
            if (errors) {
                res.status(400).send(errors);
                return;
            }

            let fixedToken = new FixedToken();
            fixedToken = req.body;
            fixedToken.Paid = false;
            fixedToken.Issued = false;
            if (!global.isProduction()) {
                fixedToken.Network = 'testnet';
            }

            if (fixedToken.Network === 'testnet') {
                if (!BITBOX.Address.isTestnetAddress(fixedToken.CoinbaseAddress)) {
                    res.status(400).send('Address is not a testnet address');
                    return;
                }
            } else {
                if (!BITBOX.Address.isMainnetAddresss(fixedToken.CoinbaseAddress)) {
                    res.status(400).send('Address is not a mainnet address');
                    return;
                }
            }

            let langs = [
                'english'
            ]

            let lang = langs[Math.floor(Math.random() * langs.length)];
            let mnemonic = BITBOX.Mnemonic.generate(256, BITBOX.Mnemonic.wordLists()[lang])
            let rootSeed = BITBOX.Mnemonic.toSeed(mnemonic)
            let masterHDNode = BITBOX.HDNode.fromSeed(rootSeed, fixedToken.Network)
            const wif = BITBOX.HDNode.toWIF(masterHDNode);
            const address = BITBOX.HDNode.toCashAddress(masterHDNode);

            fixedToken.OneTimeWif = wif;
            fixedToken.OneTimeAddr = BITBOX.HDNode.toLegacyAddress(masterHDNode);;

            const response = new FixedTokenResponse();
            response.Address = address;
            response.BchAmount = await price.GetTokenCreationPrice();
            fixedToken.Price = response.BchPrice;

            const collection = mongo.db.collection('tokenrequests');
            await collection.insertOne(fixedToken);

            res.send(response);
        } catch (err) {
            console.log(err)
            res.status(500).send('Internal server error');
        }
    })
}

function validateToken(req) {
    req.checkBody('Precision').exists().isInt({
        min: 0,
        max: 10
    });
    req.checkBody('Category').exists().isString().isLength({
        min: 1
    });
    req.checkBody('SubCategory').optional().isString();
    req.checkBody('Name').exists().isString().isLength({
        min: 1
    });
    req.checkBody('Amount').exists().isInt({
        min: 1
    });
    req.checkBody('CoinbaseAddress').exists().isString().isLength({
        min: 10
    });

    return req.validationErrors();

}