require('dotenv').load();
var swig = require('swig');
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var randtoken = require('rand-token');
var mandrill = require('node-mandrill')(process.env.MANDRILL);
var _request = require('request');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);

var sendEmail = function (email, subject, content) {
  mandrill('/messages/send', {
    message: {
      to: [{
        email: email
      }],
      from_email: 'noreply@dealsbox.co',
      from_name: 'DEALSBOX',
      subject: subject,
      html: content
    }
  }, function (error, response) {
    //uh oh, there was an error
    if (error) console.log(JSON.stringify(error));
    //everything's good, lets see what mandrill said
    else console.log(response);
  });
};

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

  if (request.method === 'post') {

    if (!request.payload.username || !request.payload.password) {
      message = 'Missing username or password';

    } else {
      db.merchants.find({
        business_email: request.payload.username
      }).limit(1, function (err, user) {
        if (err) console.log(err);
        account = user[0];

        if (user.length === 0 || !bcrypt.compareSync(request.payload.password,
            account.password)) {
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
      var price, referral_code, code_status;

      db.merchants.find({
        business_id: request.auth.credentials.business_id
      }).limit(1, function (err, result) {

        if (err) console.log(err);

        if (result[0].referral_code) {
          kaiseki.getUser(result[0].referral_code, function (err, res, body, success) {
            if (body.hasOwnProperty('error')) {
              code_status = 'invalid';
              price = (result[0].subscriber === 'no') ? '2999' : '4999';
            } else {
              code_status = 'valid';
              price = (result[0].subscriber === 'no' || result[0].referral_code_redeemed === 0) ? '0000' : '4999';
            }

            reply.view('merchant/index', {
              business_name: request.auth.credentials.business_name,
              business_email: request.auth.credentials.business_email,
              business_id: request.auth.credentials.business_id,
              subscriber: result[0].subscriber,
              price: price,
              referral_code: result[0].referral_code,
              code_status: code_status
            });

          });
        } else {
          price = (result[0].subscriber === 'no') ? '2999' : '4999';
          reply.view('merchant/index', {
            business_name: request.auth.credentials.business_name,
            business_email: request.auth.credentials.business_email,
            business_id: request.auth.credentials.business_id,
            subscriber: result[0].subscriber,
            price: price,
            code_status: 'invalid'
          });
        }
      });

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
          $or: [{
            business_email: request.payload.business_email
          }, {
            business_name: request.payload.business_name
          }]
        }).limit(1, function (err, results) {

          if (results.length === 0) {

            var data = {
              secret: process.env.Recaptcha_SECRET,
              response: request.payload['g-recaptcha-response']
            };

            _request.post({
              url: 'https://www.google.com/recaptcha/api/siteverify',
              formData: data
            }, function (err, httpResponse, body) {

              if (err) console.log(err);

              if (JSON.parse(body).success) {
                db.merchants.save({
                  business_name: request.payload.business_name,
                  business_email: request.payload.business_email,
                  subscriber: "no",
                  password: hash,
                  referral_code: request.payload.referral_code,
                  referral_code_redeemed: 0,
                  yelp_URL: request.payload.yelp_url,
                  business_id: randtoken.generate(20)
                }, function () {
                  var subject = 'Welcome to DEALSBOX Merchant';

                  swig.renderFile(appRoot + '/server/views/merchant/welcome_email.html', {
                      name: request.payload.business_name
                    },
                    function (err, content) {
                      if (err) {
                        throw err;
                      }
                      sendEmail(request.payload.business_email, subject, content);
                      reply(
                        '<span style="font-size: 2em;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">Registration successful. <a href="/business/login">Login to access account</a>.</span>'
                      );
                    });
                });
              } else {
                reply(
                  '<span style="font-size: 2em;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">You failed the reCAPTCHA question, <a href="/business/register">try again</a></span>'
                );
              }

            });
          } else {
            reply(
              '<span style="font-size: 2em;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">Already registered, Login to access account</span>'
            );
          }
        });

      }

    }

  },

  forgot_pass: {
    handler: function (request, reply) {
      if (request.method === 'get') {
        return reply.view('merchant/forgot_pass', {
          _class: 'login-page'
        });
      }

      if (request.method === 'post') {
        var email = request.payload.email;
        var subject = 'DEALSBOX: Password reset';
        var link;
        var business_id;
        db.merchants.find({
          business_email: email
        }).limit(1, function (err, result) {
          if (err) console.log(err);
          if (result.length === 1) {
            swig.renderFile(appRoot + '/server/views/password_reset.html', {
                name: result[0].business_name,
                reset_link: 'https://dealsbox.co/business/password_reset?token=' + result[0].business_id
              },
              function (err, content) {
                if (err) {
                  throw err;
                }
                sendEmail(email, subject, content);
                reply(
                  '<span style="font-size: 2em;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">Check your email to reset password.</span>'
                );
              });
          }

          if (result.length === 0) {
            reply(
              '<span style="font-size: 2em;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">Your email is not in our system.</span>'
            );
          }
        });
      }
    }
  },

  password_reset: {
    handler: function (request, reply) {

      if (request.method === 'post') {
        var hash = bcrypt.hashSync(request.payload.password, salt);

        db.merchants.findAndModify({
          query: {
            business_id: request.payload.token
          },
          update: {
            $set: {
              password: hash
            }
          },
          new: true
        }, function (err, doc, lastErrorObject) {
          reply(
            '<span style="font-size: 2em;width: 50%;margin: 10% auto 0 auto;text-align: center;display: block;border: 1px solid #cf4127;padding:10px 0;">Password updated. <a href="/business/login">Login</a></span>'
          );
        });

      }

      if (request.method === 'get') {
        return reply.view('merchant/password_reset', {
          _class: 'login-page',
          token: request.query.token
        });
      }

    }
  },

  profile: {
    handler: function (request, reply) {

      if (request.method === 'get') {
        db.merchants.find({
          business_id: request.auth.credentials.business_id
        }).limit(1, function (err, result) {
          var merchant = result[0];
          reply.view('merchant/profile', {
            business_name: merchant.business_name,
            business_id: merchant.business_id,
            business_email: merchant.business_email,
            yelp_URL: merchant.yelp_URL,
            current_period_end: merchant.current_period_end
          });
        });
      }

      if (request.method === 'post') {
        var merchant = {};
        if (request.payload.yelp_URL) merchant.yelp_URL = request.payload.yelp_URL;
        if (request.payload.business_email) merchant.business_email = request.payload.business_email;
        db.merchants.findAndModify({
          query: {
            business_id: request.payload.business_id
          },
          update: {
            $set: merchant
          },
          new: true
        }, function (err, doc, lastErrorObject) {
          reply('profile updated');
        });
      }


    },
    auth: 'session'
  }

};