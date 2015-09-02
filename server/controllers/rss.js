require('dotenv').load();
var RSS = require('rss');
var rp = require('request-promise');
var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var collections = ['deals'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var today = new Date();
today = today.toISOString();

function buildUrl(city, provider, limit) {
  var options = {
    uri: 'http://api.dealsbox.co/deals?city=' + city + '&provider=' + provider + '&limit=' + limit,
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
    webMaster: 'Parker Ituk',
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
    custom_elements: [
      {
        'media:content': {
          _attr: {
            href: obj.small_image,
            medium: "image"
          }
        }
      },
      {
        'comments': obj.new_price
      },
      {
        'source': obj.provider_name
      },
      {
        'dc:creator': obj.merchant_name
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
      var providers = ["Groupon", "Yelp", "LivingSocial", "Amazon Local"];
      var limit = 5;
      var deals = [];
      var completed_requests = 0;


      for (var i = 0, len = providers.length; i < len; i++) {
        var url = buildUrl(city, providers[i], limit);

        rp(url).then(function (res) {
          deals.push.apply(deals, JSON.parse(res));
          completed_requests++;
          if (completed_requests === providers.length) {

            var feed = feedOptions();
            deals = _.shuffle(deals);
            //  var item = dealItem();
            var counter = 0;



            for (var k = 0, dlen = deals.length; k < dlen; k++) {
              feed.item(dealItem(deals[k]));
              counter++;
            }
            if (counter === deals.length) {
              var xml = feed.xml();
              reply(xml).type('text/xml');
            }

          }
        }).catch(console.error);
      }

    },
    app: {
      name: 'main'
    }
  }

};