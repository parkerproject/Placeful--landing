require('dotenv').load();
var raccoon = require('raccoon');
raccoon.config.nearestNeighbors = 10; // number of neighbors you want to compare a user against
raccoon.config.className = 'DEALSBOX'; // prefix for your items (used for redis)
raccoon.config.numOfRecsStore = 10; // number of recommendations to store per user
raccoon.connect(process.env.REDIS_PORT, process.env.REDIS_URL, process.env.REDIS_AUTH);
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var Promise = require('es6-promise').Promise;
var _ = require('lodash')

var todayDate = new Date();

module.exports = {
  like: {
    handler: function (request, reply) {

     raccoon.liked(request.query.user_id, request.query.deal_id, function(err, success){
       reply('success');
     });

   },
   app: {
       name: 'like'
   }
  }
};
