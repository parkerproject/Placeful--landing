require('dotenv').load();
var collections = ['keen_events'];
var db_dev = require("mongojs").connect(process.env.DEV_MONGODB_URL, collections);
var Promise = require('es6-promise').Promise;
var _ = require('lodash');


module.exports = {
  like: {
    handler: function (request, reply) {
      var userId = request.query.user_id;
      var dealId = request.query.deal_id;
      reply(userId + ' liked ' + dealId);

    },
    app: {
      name: 'like'
    }
  }
};