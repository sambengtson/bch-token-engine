var assert = require('assert');
const price = require('../controllers/price')

describe('price.js', () => {
    describe('GetTokenCreationPrice', () => {
        it('Should return values less than .1', async () => {
            const tokenPrice = await price.GetTokenCreationPrice();
            const whcPrice = await price.GetWHCPrice();

            assert.ok(tokenPrice < 0.1);
            assert.ok(whcPrice < 0.1);
        });
    })
});