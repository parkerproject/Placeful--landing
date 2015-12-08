require('dotenv').load();
var collections = ['alerts', ];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);



// This is the base controller. Used for base routes, such as the default index/root path, 404 error pages, and others.
module.exports = {
  terms: {
    handler: function (request, reply) {
      // Render the view with the custom greeting
      reply.view('terms-conditions');
    },
    app: {
      name: 'terms'
    }
  },
  privacy: {
    handler: function (request, reply) {
      // Render the view with the custom greeting
      reply.view('privacy-policy');
    },
    app: {
      name: 'privacy'
    }
  },
  about: {
    handler: function (request, reply) {
      // Render the view with the custom greeting
      reply.view('about');
    },
    app: {
      name: 'about'
    },

  },
  alerts: {
    handler: function (request, reply) {
      db.alerts.find({}).limit(1, function (err, result) {

        if (result[0].status === 'true' || request.query.status == 'true') {
          console.log('passed');

          var params = {
            where: {
              receive_newsletters: true,
              objectId: request.query.user_id
            }
          };

          kaiseki.getUsers(params, function (err, res, body, success) {
            if (body.length !== 0) {
              reply.view('alerts', {
                email: body[0].email
              });
            } else {
              reply('');
            }

          });

        } else {
          reply('');
        }
      });


    },
    app: {
      name: 'alerts'
    },

  }
};