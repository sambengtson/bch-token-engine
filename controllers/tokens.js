const mongo = require('../utilities/db')

const {
    FixedTokenResponse
} = require('../models/tokens')

const email = require('../utilities/email');

const price = require('../controllers/price');
const global = require('../utilities/globals');
const BITBOXSDK = require('bitbox-sdk/lib/bitbox-sdk').default;
const bbTest = new BITBOXSDK({
    restURL: 'http://decatur.hopto.org:3003/v1/'
});
const bbMain = new BITBOXSDK({
    restURL: 'https://rest.bitcoin.com/v1/'
});
let Wormhole = require('wormhole-sdk/lib/Wormhole').default;
let wormholeMain = new Wormhole({
    restURL: 'https://rest.bitcoin.com/v1/'
});
let wormholeTest = new Wormhole({
    restURL: 'http://decatur.hopto.org:3003/v1/'
});

module.exports.IssueFixedToken = async (fixedToken) => {

    try {
        let wormhole = wormholeMain;
        let BITBOX = bbMain
        if (fixedToken.Network === 'testnet') {
            wormhole = wormholeTest;
            BITBOX = bbTest;
        }

        const ecPair = BITBOX.ECPair.fromWIF(process.env.wif);
        const address = BITBOX.ECPair.toCashAddress(ecPair);

        const balances = await wormhole.DataRetrieval.balancesForAddress(address);
        let whcBalance = balances.find(o => o.propertyid === 1);
        if (!whcBalance || parseFloat(whcBalance.balance) < 1) {
            console.log('Not enough WHC tokens')
            email.SendEmail(process.env.notificationemails, 'You have run out of WHC!!!')
            return;
        }

        let fixed = await wormhole.PayloadCreation.fixed(1, 1, 0, fixedToken.Category, fixedToken.Category, fixedToken.Name, "whctokens.cash", "Created by whctokens.cash!", fixedToken.Amount.toString());
        let utxo = await BITBOX.Address.utxo([address]);
        utxo = findBiggestUtxo(utxo);

        utxo.value = utxo.amount;
        let rawTx = await wormhole.RawTransactions.create([utxo], {});
        let opReturn = await wormhole.RawTransactions.opReturn(rawTx, fixed);
        let ref = await wormhole.RawTransactions.reference(opReturn, fixedToken.CoinbaseAddress);
        let changeHex = await wormhole.RawTransactions.change(ref, [utxo], address, 0.00001);

        let tx = wormhole.Transaction.fromHex(changeHex)
        let tb = wormhole.Transaction.fromTransaction(tx)

        let redeemScript;
        tb.sign(0, ecPair, redeemScript, 0x01, utxo[0][0].satoshis);
        let builtTx = tb.build()
        let txHex = builtTx.toHex();

        const txId = await BITBOX.RawTransactions.sendRawTransaction(txHex)
        fixedToken.Paid = true;
        fixedToken.Issued = true;
        fixedToken.IssueTx = txId;

        await mongo.db.collection('tokenrequests').updateOne({_id: fixedToken._id}, {$set: fixedToken});

        const msg = `${fixedToken.Name} has been created! <br /> <br />
        Issuing transaction: <a href="https://whc.btc.com/tx/${txId}">${txId}</a>

        Your wallet has been credited with ${fixedToken.Amount} tokens.
        `

    } catch (err) {
        //Notify somebody
        email.SendEmail(fixedToken.Email, `There has been an error when attempting to create ${fixedToken.Name}.  Our team is looking into this issue and will email you with an update within 24 hours`);
        email.SendEmail(process.env.notificationemails, err);
    }
}

function findBiggestUtxo(utxos) {
    let largestAmount = 0;
    let largestIndex = 0;
  
    for (var i = 0; i < utxos.length; i++) {
      const thisUtxo = utxos[i];
      thisUtxo.value = thisUtxo.amount;
  
      if (thisUtxo.satoshis > largestAmount) {
        largestAmount = thisUtxo.satoshis;
        largestIndex = i;
      }
    }
  
    return [utxos[largestIndex]];
  }

module.exports.RecordFixedTokenReq = async (fixedToken) => {
    if (!global.isProduction()) {
        fixedToken.Network = 'testnet';
    }

    if (fixedToken.Network === 'testnet') {
        if (!bbMain.Address.isTestnetAddress(fixedToken.CoinbaseAddress)) {
            throw 'Address is not a testnet address'
        }
    } else {
        if (!bbMain.Address.isMainnetAddresss(fixedToken.CoinbaseAddress)) {
            throw 'Address is not a mainnet address';
        }
    }

    let langs = [
        'english'
    ]

    let lang = langs[Math.floor(Math.random() * langs.length)];
    let mnemonic = bbMain.Mnemonic.generate(256, bbMain.Mnemonic.wordLists()[lang])
    let rootSeed = bbMain.Mnemonic.toSeed(mnemonic)
    let masterHDNode = bbMain.HDNode.fromSeed(rootSeed, fixedToken.Network)
    const wif = bbMain.HDNode.toWIF(masterHDNode);
    const address = bbMain.HDNode.toCashAddress(masterHDNode);

    fixedToken.OneTimeWif = wif;
    fixedToken.OneTimeAddr = bbMain.HDNode.toLegacyAddress(masterHDNode);;

    const response = new FixedTokenResponse();
    response.Address = address;
    response.BchAmount = await price.GetTokenCreationPrice();
    fixedToken.Price = response.BchAmount;

    const collection = mongo.db.collection('tokenrequests');
    await collection.insertOne(fixedToken);

    return response;
}