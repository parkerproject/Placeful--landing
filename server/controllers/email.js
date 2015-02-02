require('dotenv').load();
var collections = ['early_access'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var swig = require('swig');
var rp = require('request-promise');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var _ = require('underscore');
var mandrill = require('node-mandrill')(process.env.MANDRILL);
var CronJob = require('cron').CronJob;

function saveEmail(email, reply) {
  db.early_access.save({
    email: email
  }, function(err, success) {
    console.log(success);
    if (err) reply('<span class="error">oops! looks like the server failed. Try again</span>');
    if (success) reply(1);
  });

}

function sendEmails(email, subject, content) {
  mandrill('/messages/send', {
    message: {
      to: [{
        email: email
      }],
      from_email: 'no-reply@dealsbox.co',
      subject: subject,
      html: content
    }
  }, function(error, response) {
    //uh oh, there was an error
    if (error) console.log(JSON.stringify(error));

    //everything's good, lets see what mandrill said
    else console.log(response);
  });
}


function buildTemplate(deals, cb) {
  swig.renderFile(__base + 'server/views/newsletter.html', {
      deals: JSON.parse(deals)
    },
    function(err, content) {
      if (err) {
        throw err;
      }
      cb(content);
    });

}



function endpoint(city) {
  return 'http://api.dealsbox.co/deals?limit=20&city=' + city;
}



function getUsers(cb) {
  var params = {
    where: {
      receive_newsletters: true
    }
  };

  kaiseki.getUsers(params, function(err, res, body, success) {
    cb(body);
  });
}



function groupUsers(cb) {
  var i, city, groups = {};
  getUsers(function(users) {

    for (i = 0; i < users.length; i++) {
      city = users[i].city;
      if (!(city in groups)) { //check if groups already has city property

        groups[city] = [];

      }

      groups[city].push(users[i]);
    }
    cb(groups);
  });
}




function getDeals() {

  groupUsers(function(groups) {

    var cityOfUsers = Object.keys(groups);

    for (var i = 0, len = cityOfUsers.length; i < len; i++) {
      var city = cityOfUsers[i];
      var url = endpoint(city);
      var emails = _.pluck(groups[city], 'email'); //grab all emails in this city
      var subject = 'Dealsbox daily digest';
      console.log(city, emails);

      (function(index, userEmails, _city) {
        rp(url)
          .then(function(deals) {
            for (var e = 0; e < userEmails.length; e++) {
              // another closure with IIFE
              (function(_index) {
                buildTemplate(deals, function(content) {
                  sendEmails(userEmails[_index], subject, content);
                });

              }(e));

            }
          })
          .
        catch (console.error);

      }(i, emails, city));


    }

  });

}


var job = new CronJob({
  cronTime: '0-59', //'00 30 11 * * 1-7',
  onTick: function() {
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
  storeEmail: {
    handler: function(request, reply) {
      var email = request.params.email;
      db.early_access.findOne({
        email: email
      }, function(err, result) {
        if (err) console.log(err);
        if (result) {
          reply('You have already submitted your email.');
        } else {
          saveEmail(email, reply);
        }
      });


    },
    app: {
      name: 'storeEmail'
    }
  },

  welcomeEmail: {
    handler: function(request, reply) {
      var email = request.params.email;
      var name = request.params.name;

      swig.renderFile(__base + 'views/welcome.html', {
          name: name
        },
        function(err, content) {
          if (err) {
            throw err;
          }
          sendEmails(email, subject, content);
        });


    },
    app: {
      name: 'welcomeEmail'
    }
  },

  newsletter: {
    handler: function(request, reply) {
      var name = request.params.name;

      rp('http://api.dealsbox.co/deals?category=Food%20%26%20Drinks&city=new%20york&limit=20')
        .then(function(deals) {
          deals = JSON.parse(deals);
          reply.view('newsletter', {
            deals: deals
          });
        })
        .
      catch (console.error);

    },
    app: {
      name: 'newsletter'
    }
  }

};