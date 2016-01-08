require('dotenv').load();
var _ = require('lodash');
var req = require('request');
var collections = ['deals'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);

module.exports = {
  index: {
    handler: function (request, reply) {

      req("http://api.dealsbox.co/deal?id=" + request.params.deal_id, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var deal = JSON.parse(body);
          var button_text = (deal.provider_name === 'DEALSBOX') ? 'View coupon in app' : 'BUY FROM ' + deal.provider_name;
          var button_url = (deal.provider_name === 'DEALSBOX') ? 'https://app.appsflyer.com/id944253010?pid=deal_page' : deal.url;
          var price = (deal.provider_name === 'DEALSBOX') ? deal.offer : '$' + deal.new_price;
          var facebook_image_url = "http://imagify.co/img?url=" + deal.large_image + "&crop_width=200&crop_height=200";
          var facebook_url = 'https://dealsbox.co/deal/' + request.params.deal_id
          req("https://merchant.dealsbox.co/lab/yelp_phone?phone=" + JSON.parse(body).phone, function (err, res, data) {
            if (!err && res.statusCode == 200) {
              deal.yelp = JSON.parse(data);
              reply.view("deal", {
                deal: deal,
                button_text: button_text,
                button_url: button_url,
                price: price,
                facebook_url: facebook_url,
                facebook_image_url: facebook_image_url
              });

            }
          });



        }
      });

    }
  }
};