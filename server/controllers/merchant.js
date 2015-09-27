// This is the base controller. Used for base routes, such as the default index/root path, 404 error pages, and others.
require('dotenv').load();
var swig = require('swig');
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var bcrypt = require('bcrypt');

module.exports = {
  index: {
    handler: function(request, reply) {

      reply.view('merchant/index', {

        title: 'Discover and save on local deals - DEALSBOX'
      });

    },
    app: {
      name: 'index'
    }
  },

  login: {
    handler: function(request, reply) {

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
    handler: function(request, reply) {

      reply.view('merchant/register', {

        title: 'Discover and save on local deals - DEALSBOX',
        _class: 'login-page'
      });

    },
    app: {
      name: 'register'
    }
  },
	
	register_post: {
    handler: function(request, reply) {

      if (request.payload) {
        var password = request.payload.password;
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);

        db.merchants.find({
          business_email: request.payload.business_email
        }).limit(1, function(err, results) {

          if (results.length === 0) {
            db.merchants.save({
              business_name: request.payload.business_name,
              business_email: request.payload.business_email,
              password: hash
            }, function() {
              reply('Registration successful. Login to access account');
            });
          }else{
						reply('Already registered, Login to access account');
					}
        });
      }

    },
    app: {
      name: 'register_post'
    }
  }

};