exports.isProduction = () => {
    return process.env.production === "true";
}

exports.GetNewAddress = () =>  {
    const wif = process.env.wif;
}