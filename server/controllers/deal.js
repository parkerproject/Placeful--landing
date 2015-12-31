require('dotenv').load();
var _ = require('lodash');
var req = require('request');

module.exports = {
  index: {
    handler: function (request, reply) {

      req("http://api.dealsbox.co/deal?id=" + request.params.deal_id, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var deal = JSON.parse(body);
          req("https://dealsbox.co/lab/yelp_phone?phone=" + JSON.parse(body).phone, function (err, res, data) {
            if (!err && res.statusCode == 200) {
              deal.yelp = JSON.parse(data);
              reply.view("deal", {
                deal: deal
              });

            }
          });
        }
      });

    }
  }
};