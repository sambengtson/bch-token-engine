const BITBOXSDK = require('bitbox-sdk/lib/bitbox-sdk').default;
const BITBOX = new BITBOXSDK();

module.exports.GetTokenCreationPrice = async  () => {
    let price = 30;
    if (process.env.tokenprice) {
        price = parseInt(process.env.tokenprice);
    }

    const usdPrice = price;
    const bchPrice = await BITBOX.Price.current();

    const tokenPrice = usdPrice / parseFloat(bchPrice.USD);
    return tokenPrice.toFixed(5);
}

module.exports.GetWHCPrice = async () => {
    let price = 15;
    if (process.env.tokenprice) {
        price = parseInt(process.env.whcprice);
    }

    const usdPrice = price
    const bchPrice = await BITBOX.Price.current();

    const whcPrice = usdPrice / parseFloat(bchPrice.USD);
    return whcPrice.toFixed(5);
}