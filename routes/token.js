const {
    body
} = require('express-validator/check')
const tokenCtrl = require('../controllers/tokens');
const {
    FixedToken
} = require('../models/tokens')


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

            const response = await tokenCtrl.RecordFixedTokenReq(fixedToken);
            res.send(response);
        } catch (err) {
            console.log(err)
            res.status(500).send(err);
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