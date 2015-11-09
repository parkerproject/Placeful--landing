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
      kaiseki.getUser(request.query.id, function (err, res, body, success) {
        if (!body.hasOwnProperty('error')) {
          reply.view('merchant/referral_coupon', {
            code: request.query.id
          });
        } else {
          reply('<h2>Invalid referral link</h2>');
        }

      });
    }
  }

};