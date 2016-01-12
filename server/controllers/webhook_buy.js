require('dotenv').load();
var collections = ['webhook', 'deals'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
// var intercom = require('intercom.io');
var Keen = require("keen-js");
var client = new Keen({
  projectId: process.env.KEEN_PROJECTID,
  writeKey: process.env.KEEN_WRITEKEY
});

var score = 3;



module.exports = {
  index: {
    handler: function (request, reply) {
      db.webhook.save(request.payload);

      var data = request.payload.data.item.metadata;

      if (data) {
        data.keen = {
          timestamp: new Date().toISOString()
        };
      }

      db.deals.find({
        deal_id: data.deal_id
      }).limit(1, function (err, result) {
        db.webhook.find({
          deal_id: data.deal_id
        }).limit(1, function (err, deal) {
          if (deal.length === 0) {

            result[0].score = score;

            delete result[0]['_id'];

            db.webhook.save(result[0]);

            client.addEvent("buy", result, function (err, res) {

              if (err) {
                console.log(err);
              } else {
                reply('success');
              }
            });
          } else {
            db.webhook.findAndModify({
              query: {
                deal_id: data.deal_id,
              },
              update: {
                $inc: {
                  score: score
                }
              },
              new: true
            }, function (err, doc, lastErrorObject) {
              reply('update successful');
            });
          }
        })



      });

    }
  }
};