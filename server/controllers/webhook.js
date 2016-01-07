require('dotenv').load();
var collections = ['webhook'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
// var intercom = require('intercom.io');



module.exports = {
  user: {
    handler: function (request, reply) {
      var payload = request.payload;
      db.webhook.save(payload);
    }
  }
};