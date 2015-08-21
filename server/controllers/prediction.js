require('dotenv').load();
var collections = ['keen_events'];
var db_dev = require("mongojs").connect(process.env.DEV_MONGODB_URL, collections);
var raccoon = require('raccoon');
raccoon.config.nearestNeighbors = 5; // number of neighbors you want to compare a user against
raccoon.config.className = 'DEALSBOX'; // prefix for your items (used for redis)
raccoon.config.numOfRecsStore = 10; // number of recommendations to store per user
raccoon.connect(process.env.REDIS_PORT, process.env.REDIS_URL, process.env.REDIS_AUTH);
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var Promise = require('es6-promise').Promise;
var _ = require('lodash');


module.exports = {
  like: {
    handler: function (request, reply) {
      var userId = request.query.user_id;
      var dealId = request.query.deal_id;
      var action = request.query.action;
      var s = new Date();
      var timestamp = s.toISOString();
      var dataObj = {
        event: action,
        user_id: userId,
        deal_id: dealId,
        timestamp: timestamp
      };

      db_dev.keen_events.find(dataObj).limit(1, function (err, docs) {

        if (docs.length === 0) {
          db_dev.keen_events.save(dataObj);
        }

      });

      raccoon.liked(userId, dealId, function (err, success) {
        reply('success');
      });

    },
    app: {
      name: 'like'
    }
  }
};