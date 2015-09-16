require('dotenv').load();
var collections = ['alerts', ];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);



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

        if (result[0].status === 'true') {

          reply.view('alerts', {
            code: result[0].code,
            message: result[0].message,
            end_date: result[0].end_date
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