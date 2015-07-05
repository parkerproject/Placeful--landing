require('dotenv').load();
var swig = require('swig');
var rp = require('request-promise');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var collections = ['deals', 'cities', 'categories', 'providers', 'price', 'zipcodes'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var _ = require('lodash');
var sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);
var CronJob = require('cron').CronJob;
var Promise = require('es6-promise').Promise;



var payload = {
  to: 'parkerproject@gmail.com',
  from: 'from@other.com',
  subject: 'Saying Hi',
  html: '<strong>This is my first email through SendGrid</strong>'
};

// sendgrid.send(payload, function(err, json) {
//   if (err) { console.error(err); }
//   console.log(json);
// });





function buildTemplate(deals, cb, tpl) {
  swig.renderFile(__base + 'server/views/' + tpl + '.html', {
      deals: JSON.parse(deals)
    },
    function (err, content) {
      if (err) {
        throw err;
      }
      cb(content);
    });

}



function getUsers(cb) {
  var params = {
    where: {
      receive_newsletters: true,
      objectId: 'He8hQies9q'
    }
  };

  kaiseki.getUsers(params, function (err, res, body, success) {
    cb(body);
  });
}


function buildUrl(query, zipcode, category, limit){
  var options = {
    uri: 'http://api.dealsbox.co/deals/search?q='+query+'&zipcode='+zipcode+'&category='+category+'&limit='+limit,
    method: 'GET'
  };

  return options;
}




var job = new CronJob({
  cronTime: '0-59', //'00 30 11 * * 1-7',
  onTick: function () {
    // Runs every weekday (Monday through Friday)
    // at 11:30:00 AM. It does not run on Saturday
    // or Sunday.
    //getDeals();

  },
  start: false,
  timeZone: "America/New_York"
});
job.start();



module.exports = {
  weekly: {
    handler: function (request, reply) {

      var users;
      var deals = [];
      var zipcode = '07024';

      new Promise(function(resolve) {
        var params = {
          where: {
            receive_newsletters: true,
            objectId: 'He8hQies9q'
          }
        };

        kaiseki.getUsers(params, function (err, res, body, success) {
          users = body;
          resolve();
        });

      }).then(function() {
          return new Promise(function(resolve) {
            var category = 'Health%2C%20Beauty%20%26%20Fitness';
            var query = 'health fitness spa';
            var limit = 5;
            var options = buildUrl(query, zipcode, category, limit);

            rp(options)
              .then(function(res){
                deals.push(JSON.parse(res));
                resolve();
              })
              .catch(console.error);
          });
      }).then(function() {
          return new Promise(function(resolve) {
            var category = 'food';
            var query = 'Food%20%26%20Drinks';
            var limit = 10;
            var options = buildUrl(query, zipcode, category, limit);

            rp(options)
              .then(function(res){
                deals.push(JSON.parse(res));
                resolve();
              })
              .catch(console.error);
          });
      }).then(function() {
          return new Promise(function(resolve) {
            var category = 'Events%20%26%20Activities';
            var query = 'shows entertainment events';
            var limit = 5;
            var options = buildUrl(query, zipcode, category, limit);

            rp(options)
              .then(function(res){
                deals.push(JSON.parse(res));
                resolve();
              })
              .catch(console.error);
          });
      }).then(function() {
        deals = _.flattenDeep(deals);
        deals = _.shuffle(deals);
        console.log(deals.length);
        reply.view('weekly', {
          title: 'Discover and save on local deals - DEALSBOX',
          data: _.first(deals),
          deals: _.rest(deals),
          user: _.first(users)
        });
      });
    },
    app: {
      name: 'weekly'
    }
  },

  recommended: {
    handler: function (request, reply) {},
    app: {
      name: 'recommended'
    }
  },

  unsubscribe: {
    handler: function (request, reply) {
      var user_id = request.query.user;
      kaiseki.sessionToken = 'le session token';
      kaiseki.updateUser(user_id, {receive_newsletters: false}, function(err, res, body, success) {
        reply('You will no longer receive newsletter');
      });
    },
    app: {
      name: 'unsubscribe'
    }
  }
};
