const price = require('../controllers/price');

module.exports.SetRoutes = (app) => {

    app.get('/price/token', async (req, res) => {
        try {
            const p = await price.GetTokenCreationPrice();
            res.send(p);
        } catch (err) {
            res.status(500).send('Internal server error');
        }
    })

    app.get('/price/whc', async (req, res) => {
        try {
            const p = await price.GetWHCPrice()
            res.send(p);
        } catch (err) {
            res.status(500).send('Internal server error');
        }
    })
}