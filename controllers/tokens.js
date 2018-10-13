const mongo = require('../utilities/db')

const {
    FixedTokenResponse
} = require('../models/tokens')

const price = require('../controllers/price');
const global = require('../utilities/globals');
const BITBOXSDK = require('bitbox-sdk/lib/bitbox-sdk').default;
const BITBOX = new BITBOXSDK();

module.exports.RecordFixedTokenReq = async (fixedToken) => {
    if (!global.isProduction()) {
        fixedToken.Network = 'testnet';
    }

    if (fixedToken.Network === 'testnet') {
        if (!BITBOX.Address.isTestnetAddress(fixedToken.CoinbaseAddress)) {
            throw 'Address is not a testnet address'            
        }
    } else {
        if (!BITBOX.Address.isMainnetAddresss(fixedToken.CoinbaseAddress)) {
            throw 'Address is not a mainnet address';
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
    fixedToken.Price = response.BchAmount;

    const collection = mongo.db.collection('tokenrequests');
    await collection.insertOne(fixedToken);

    return response;
}