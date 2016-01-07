require('dotenv').load();
var swig = require('swig');
var collections = ['merchants'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var _request = require('request');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var Joi = require('joi');



module.exports = {
  index: {
    handler: function (request, reply) {
      var params = {
        where: {
          email: request.query.email
        }
      };

      kaiseki.getUsers(params, function (err, res, body, success) {
        if (!body.hasOwnProperty('error')) {
          reply.view('referral_coupon', {
            code: body[0].objectId
          });
        } else {
          reply('<h2>Invalid referral link</h2>');
        }

      });
    },
    validate: {
      query: {
        email: Joi.string().required()
      }
    }
  }

};