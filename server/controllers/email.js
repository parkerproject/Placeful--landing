require('dotenv').load();
var collections = ['early_access'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var swig = require('swig');
var rp = require('request-promise');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var _ = require('underscore');
var mandrill = require('node-mandrill')(process.env.MANDRILL);

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
			from_name: 'Dealsbox Team',
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
      var user = request.params.user;
			var email = user.split('/')[0];
      var name = user.split('/')[1];
			var subject = 'Welcome to Dealsbox';

      swig.renderFile(__base + 'server/views/welcome_email.html', {
          name: name
        },
        function(err, content) {
          if (err) {
            throw err;
          }
          sendEmails(email, subject, content);
          reply('Email sent');
        });


    },
    app: {
      name: 'welcomeEmail'
    }
  }

};