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


function buildUrl(zipcode, category, limit) {
  var options = {
    uri: 'http://api.dealsbox.co/deals/newsletter?zipcode=' + zipcode + '&category=' + category + '&limit=' + limit,
    method: 'GET'
  };

  return options;
}



function handlerEmail() {

  var params = {
    where: {
      receive_newsletters: true,
      objectId: 'He8hQies9q'
    }
  };

  kaiseki.getUsers(params, function (err, res, body, success) {


    body.forEach(function (user) {

      var zipcode = user.zip;
      var deals = [];

      return new Promise(function (resolve) {
        var category = 'Health%2C%20Beauty%20%26%20Fitness';
        var limit = 5;
        var options = buildUrl(zipcode, category, limit);

        rp(options).then(function (res) {
          deals.push(JSON.parse(res));
          resolve();
        }).catch(console.error);
      }).then(function () {
        return new Promise(function (resolve) {
          var category = 'Food%20%26%20Drinks';
          var limit = 10;
          var options = buildUrl(zipcode, category, limit);

          rp(options).then(function (res) {
            deals.push(JSON.parse(res));
            resolve();
          }).catch(console.error);
        });
      }).then(function () {
        return new Promise(function (resolve) {
          var category = 'Events%20%26%20Activities';
          var limit = 5;
          var options = buildUrl(zipcode, category, limit);

          rp(options).then(function (res) {
            deals.push(JSON.parse(res));
            resolve();
          }).catch(console.error);
        });
      }).then(function (res) {
        deals = _.flattenDeep(deals);
        deals = _.shuffle(deals);

        swig.renderFile(__base + 'server/views/weekly.html', {
            data: _.first(deals),
            deals: _.rest(deals),
            user: user
          },
          function (err, content) {
            if (err) {
              throw err;
            }
            var payload = new sendgrid.Email({
              to: user.email,
              from: 'hello@dealsbox.co',
              fromname: 'DEALSBOX',
              //subject: 'Enjoy today\'s local deals',
              subject: _.first(deals).title,
              html: content
            });

            sendgrid.send(payload, function (err, json) {
              if (err) {
                console.error(err);
              }
              console.log(json);
            });
          });

      });

    });

  });
}


module.exports = {
  weekly: {
    handler: function (request, reply) {

      // return new Promise(function (resolve) {
      //
      //   //handlerEmail();
      //   console.log('started the email program');
      //
      //   resolve();
      //
      // }).then(function () {
      //
      //  reply('email sent');
      //
      // });

      reply('email sent');
    },
    app: {
      name: 'weekly'
    }
  },

  recommended: {
    handler: function (request, reply) {

    },
    app: {
      name: 'recommend'
    }
  }

};


// var job = new CronJob({
//   cronTime: '00 30 11 * * 0-7',
//   onTick: function() {
//      handlerEmail();
//   },
//   start: false,
//   timeZone: "America/New_York"
// });
// job.start();