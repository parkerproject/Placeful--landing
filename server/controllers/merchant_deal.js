require('dotenv').load();
var swig = require('swig');
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var yelp = require('yelp');
var yelp = require("yelp").createClient({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET
});
var randtoken = require('rand-token');
var fs = require('fs');
var path = require('path');

var getYelpId = function (url) {
  var businessUrlOnYelp = url,
    businessUrlOnYelpLength;
  businessUrlOnYelp = businessUrlOnYelp.split('?')[0];
  businessUrlOnYelp = businessUrlOnYelp.split('/');
  businessUrlOnYelpLength = businessUrlOnYelp.length;
  return businessUrlOnYelp[businessUrlOnYelpLength - 1];
};


module.exports = {
  index: {
    handler: function (request, reply) {

      if (!request.auth.isAuthenticated) {
        return reply.redirect('/business/login');
      }

      reply.view('merchant/add_deal', {
        _class: 'login-page',
        business_email: request.auth.credentials.business_email,
        yelp_URL: request.auth.credentials.yelp_URL,
        business_name: request.auth.credentials.business_name,
      });

    },
    auth: 'session'
  },

  builder: {
    payload: {
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    handler: function (request, reply) {
      var deal_id = '';
      deal_id = randtoken.generate(12);
      var payload = request.payload;
      var yelpBizId = getYelpId(payload.yelp_URL);

      var start_date = request.payload.deal_date.split('-')[0];
      var end_date = request.payload.deal_date.split('-')[1];
      var d = new Date();
      var insert_date = d.toISOString();

      yelp.business(yelpBizId, function (error, data) {
        console.log(error);
        var deal = {
          insert_date: insert_date,
          coupon: "yes",
          new_price: payload.deal_price,
          deal_id: deal_id,
          loc: {
            type: "Point",
            coordinates: [data.location.coordinate.longitude,
                data.location.coordinate.latitude
              ]
          },
          title: payload.title,
          provider_name: "DEALSBOX",
          merchant_locality: data.location.city,
          merchant_name: data.name,
          large_image: "",
          description: payload.description,
          old_price: payload.normal_price,
          expires_at: end_date,
          start_date: start_date,
          quantity_bought: "",
          phone: data.display_phone,
          category_name: payload.category,
          url: 'http://dealsbox.co/',
          small_image: "",
          merchant_address: data.location.display_address,
          savings: "",
          zip_code: data.location.postal_code,
          Yelp_rating: data.rating,
          Yelp_categories: data.categories,
          Yelp_reviews: data.reviews
        };
        if (payload.file) {
          var filename = payload.file.hapi.filename;
          filename = deal_id + path.extname(filename);
          var imagePath = __dirname + "/deal_images/" + filename;
          var file = fs.createWriteStream(imagePath);
          file.on('error', function (err) {
            console.error(err);
          });
          payload.file.pipe(file);

          payload.file.on('end', function (err) {
            deal.large_image = 'http://dealsbox.co/deal_images/' + filename;
            //reply(JSON.stringify(ret));
            reply(deal);
          });
        }

      });
    }
  },

  yelp: {
    handler: function (request, reply) {
      yelp.business(getYelpId(request.query.yelp_URL), function (error, data) {
        console.log(error);
        reply(data);
      });
    }
  }
};