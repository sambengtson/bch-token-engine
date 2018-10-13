class FixedToken {
    constructor() {
        this.Precision = 0;
        this.Category = '';
        this.SubCategory = '';
        this.Name = '';
        this.Url = 'https://whctokens.cash';
        this.Data = 'Token created with whctokens.cash!';
        this.Amount = 0;
        this.CoinbaseAddress = ''
        this.Paid = false;
        this.PaidTx = '';
        this.IssueTx = '';
        this.Issued = false;
        this.Network = 'mainnet';
        this.OneTimeWif = '';
        this.OneTimeAddr = '';
        this.Price = 0;
        this.Email = ''
    }
}

class FixedTokenResponse {
    constructor() {
        this.Address = '';
        this.BchAmount = 0;
    }
}

module.exports = {FixedToken, FixedTokenResponse};