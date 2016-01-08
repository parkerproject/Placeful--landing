require('dotenv').load();
var collections = ['webhook'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
// var intercom = require('intercom.io');
var Keen = require("keen-js");
var client = new Keen({
  projectId: process.env.KEEN_PROJECTID,
  writeKey: process.env.WRITEKEY
});



module.exports = {
  user: {
    handler: function (request, reply) {
      db.webhook.save(request.payload);
      var data = request.payload.data.item.metadata;

      if (data) {
        data.keen = {
          timestamp: new Date().toISOString()
        };
      }

      //db.webhook.save(data);

      client.addEvent("views", data, function (err, res) {
        if (err) {
          console.log('error');
        } else {
          console.log('success');
        }
      });
    }
  }
};