require('dotenv').load();
var swig = require('swig');
var rp = require('request-promise');
var Parse = require('node-parse-api').Parse;
var parseOptions = {
  app_id: process.env.PARSE_APP_ID,
  api_key: process.env.PARSE_REST_API_KEY
};
var parseApp = new Parse(parseOptions);
var _ = require('lodash');
var sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);
var schedule = require('node-schedule');
var Promise = require('es6-promise').Promise;
var emails;





function handlerEmail() {

  parseApp.find('_User', {
    limit: 1000
  }, function (err, response) {

    return new Promise(function (resolve) {

      emails = _.pluck(response.results, 'email');

      resolve(emails);

    }).then(function (res) {

      swig.renderFile(__base + 'server/views/promo.html', {}, function (err, content) {
        if (err) {
          throw err;
        }
        var payload = new sendgrid.Email({
          from: 'hello@dealsbox.co',
          fromname: 'DEALSBOX',
          subject: 'Groupon September Sale!',
          html: content
        });

        //payload.setTos(emails);

        sendgrid.send(payload, function (err, json) {
          if (err) {
            console.error(err);
          }
          console.log(json);
        });
      });

    });

  });
}


module.exports = {
  testing: {
    handler: function (request, reply) {

      return new Promise(function (resolve) {

        //handlerEmail();

        resolve();

      }).then(function (res) {

        reply('email sent');

      });
    },
    app: {
      name: 'testing'
    }
  }

};

// schedule.scheduleJob('00 30 11 * * 0-7', function () {
//   handlerEmail();
// });


// var job = new CronJob({
//   cronTime: '00 30 11 * * 0-7',
//   onTick: function() {
//      handlerEmail();
//   },
//   start: false,
//   timeZone: "America/New_York"
// });
// job.start();