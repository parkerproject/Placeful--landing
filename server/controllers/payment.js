require('dotenv').load();
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  index: {
    handler: function (request, reply) {

      stripe.customers.create({
        email: request.payload.stripeEmail,
        source: request.payload.stripeToken,
        metadata: {
          business_id: request.auth.credentials.business_id
        },
        plan: 'merchant00'
      }, function (err, customer) {
        if (err) console.log(err);

        db.merchants.findAndModify({
          query: {
            business_id: request.auth.credentials.business_id
          },
          update: {
            $set: {
              subscriber: 'yes'
            }
          },
          new: true
        }, function (err, doc, lastErrorObject) {
          return reply.redirect('/business/deal');
        });

      });

    },
    auth: 'session'
  }
};