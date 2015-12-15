require('dotenv').load();
var RSS = require('rss');
var rp = require('request-promise');
var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var collections = ['deals'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var today = new Date();
today = today.toISOString();
var req = require('request');

function buildUrl(city, provider, limit, category) {
  var options = {
    uri: 'http://api.dealsbox.co/deals?city=' + city + '&provider=' + provider + '&limit=' + limit + '&category=' + category,
    method: 'GET'
  };

  return options;
}


function feedOptions() {


  var feed = new RSS({
    title: 'local deals feed',
    description: 'A weekly local deals digest',
    feed_url: 'http://dealsbox.co/feed.xml',
    site_url: 'http://dealsbox.co',
    image_url: 'http://bit.ly/1NTsqW6',
    managingEditor: 'DEALSBOX',
    webMaster: 'DEALSBOX',
    copyright: '2015 DEALSBOX',
    language: 'en',
    categories: ['local deals'],
    pubDate: today,
    ttl: '60',
    custom_namespaces: {
      'media': 'http://example.com',
      'dc': 'author'
    },
  });

  return feed;
}

function dealItem(obj) {
  return {

    title: obj.title,
    description: obj.merchant_address,
    url: obj.url,
    guid: obj.deal_id,
    date: obj.insert_date,
    lat: obj.loc.coordinates[1],
    long: obj.loc.coordinates[0],
    enclosure: {
      url: obj.large_image
    },
    custom_elements: [{
        'media:content': {
          _attr: {
            url: obj.large_image,
            medium: "image"
          }
        }
      }, {
        'comments': obj.new_price
      }, {
        'source': obj.provider_name
      }, {
        'author': obj.merchant_name
      }

    ]

  };
}




module.exports = {
  main: {
    handler: function (request, reply) {

      var city = request.query.city;
      city = city.replace("-", " ");
      city = encodeURIComponent(city);
      var category = encodeURIComponent('Health, Beauty & Fitness');
      var deals = [];
      var completed_requests = 0;
      var feed = feedOptions();
      var sample;

      return new Promise(function (resolve) {
        req(buildUrl(city, 'Groupon', 20, category), function (error, response, body) {
          if (!error && response.statusCode == 200) {
            sample = _.sample(JSON.parse(body), 3);
            deals.push.apply(deals, sample);
            resolve(deals);
          }
        });
      }).then(function (res) {
        return new Promise(function (resolve) {
          req(buildUrl(city, 'LivingSocial', 20, category), function (error, response, body) {
            if (!error && response.statusCode == 200) {
              sample = _.sample(JSON.parse(body), 1);
              deals.push.apply(deals, sample);
              resolve(deals);
            }
          });
        });
      }).then(function () {
        return new Promise(function (resolve) {
          req(buildUrl(city, 'amazon local', 20, category), function (error, response, body) {
            if (!error && response.statusCode == 200) {
              sample = _.sample(JSON.parse(body), 1);
              deals.push.apply(deals, sample);
              resolve(deals);
            }
          });
        });
      }).then(function () {
        return new Promise(function (resolve) {
          req(buildUrl(city, 'yelp', 20, category), function (error, response, body) {
            if (!error && response.statusCode == 200) {
              sample = _.sample(JSON.parse(body), 1);
              deals.push.apply(deals, sample);
              resolve(deals);
            }
          });
        });
      }).then(function () {
        deals.forEach(function (deal) {
          feed.item(dealItem(deal));
        });
        var xml = feed.xml();
        reply(xml).type('text/xml');
      });

    },
    app: {
      name: 'main'
    }
  }

};