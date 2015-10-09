// This is the base controller. Used for base routes, such as the default index/root path, 404 error pages, and others.
require('dotenv').load();
var swig = require('swig');
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);


var replyFn = function (reply, message) {

  return reply.view('merchant/login', {
    _class: 'login-page',
    message: message
  });

};

var login = function (request, reply) {

  if (request.auth.isAuthenticated) {
    return reply.redirect('/business');
  }

  var message = '';
  var account = null;
  var passwordStatus;

  if (request.method === 'post') {

    if (!request.payload.username || !request.payload.password) {
      message = 'Missing username or password';

    } else {
      db.merchants.find({
        business_email: request.payload.username
      }).limit(1, function (err, user) {
        if (err) console.log(err);
        account = user[0];

        if (user.length === 0 || !bcrypt.compareSync(request.payload.password, account.password)) {
          message = 'Invalid username or password';
          replyFn(reply, message);
        } else {
          request.auth.session.set(account);
          return reply.redirect('/business');
        }

      });
    }
  }

  if (request.method === 'get' || message) {
    replyFn(reply, message);
  }

  // request.auth.session.set(account);
  // return reply.redirect('/business');

};


var loginOptions = {
  handler: login,
  auth: {
    mode: 'try',
    strategy: 'session'
  },
  plugins: {
    'hapi-auth-cookie': {
      redirectTo: false
    }
  }
};


var logout = function (request, reply) {

  request.auth.session.clear();
  return reply.redirect('/business/login');
};

module.exports = {
  index: {
    handler: function (request, reply) {

      reply.view('merchant/index', {});

    },
    auth: 'session'
  },

  login: loginOptions,
  logout: {
    handler: logout
  },
  register: {
    handler: function (request, reply) {

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
    handler: function (request, reply) {

      if (request.payload) {
        var password = request.payload.password;
        var hash = bcrypt.hashSync(password, salt);

        db.merchants.find({
          business_email: request.payload.business_email
        }).limit(1, function (err, results) {

          if (results.length === 0) {
            db.merchants.save({
              business_name: request.payload.business_name,
              business_email: request.payload.business_email,
              password: hash
            }, function () {
              reply('Registration successful. Login to access account');
            });
          } else {
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