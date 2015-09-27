// This is the base controller. Used for base routes, such as the default index/root path, 404 error pages, and others.
require('dotenv').load();
var swig = require('swig');
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL,
  collections);

module.exports = {
  index: {
    handler: function (request, reply) {

      reply.view('merchant/index', {

        title: 'Discover and save on local deals - DEALSBOX'
      });

    },
    app: {
      name: 'index'
    }
  },

  login: {
    handler: function (request, reply) {

      reply.view('merchant/login', {

        title: 'Discover and save on local deals - DEALSBOX',
        _class: 'login-page'
      });

    },
    app: {
      name: 'login'
    }
  },
  register: {
    handler: function (request, reply) {

      if (request.payload) {

        console.log(request.payload);
        reply('posted');
      }

      reply.view('merchant/register', {

        title: 'Discover and save on local deals - DEALSBOX',
        _class: 'login-page'
      });

    },
    app: {
      name: 'register'
    }
  }

};