require('dotenv').load();
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var moment = require('moment');

module.exports = {
  index: {
    handler: function (request, reply) {
      var customer = {
        email: request.payload.stripeEmail,
        source: request.payload.stripeToken,
        metadata: {
          business_id: request.auth.credentials.business_id
        },
        plan: 'merchant00'
      };

      if (request.payload.subscribe === 'no') customer.coupon = 'START40';
      if (request.payload.subscribe === 'no' || request.payload.code_status === 'valid') customer.coupon = 'SAVE40';

      stripe.customers.create(customer, function (err, customer) {
        if (err) console.log(err);

        var current_period_end = moment.unix(customer.subscriptions.data[0].current_period_end);

        db.merchants.findAndModify({
          query: {
            business_id: request.auth.credentials.business_id
          },
          update: {
            $set: {
              subscriber: 'yes',
              current_period_end: current_period_end.format(),
              referral_code_redeemed: 1
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