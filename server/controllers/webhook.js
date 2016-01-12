require('dotenv').load();
var collections = ['webhook', 'deals'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
// var intercom = require('intercom.io');
var Keen = require("keen-js");
var client = new Keen({
  projectId: process.env.KEEN_PROJECTID,
  writeKey: process.env.KEEN_WRITEKEY
});



module.exports = {
  user: {
    handler: function (request, reply) {

      var data = request.payload.data.item.metadata;
      db.webhook.save(request.payload);

      // if (data) {
      //   data.keen = {
      //     timestamp: new Date().toISOString()
      //   };
      // }

      // db.deals.find({
      //   deal_id: data.deal_id
      // }).limit(1, function (err, result) {
      //   db.webhook.findAndModify({
      //     query: {
      //       deal_id: result.deal_id
      //     },
      //     update: {
      //       $inc: {
      //         view_count: 1
      //       }
      //     },
      //     new: true,
      //     upsert: true
      //   }, function (err, doc, lastErrorObject) {
      //     // doc.tag === 'maintainer'
      //     client.addEvent("views", data, function (err, res) {
      //       if (err) {
      //         console.log(err);
      //       } else {
      //         console.log(res);
      //       }
      //     });
      //   });
      //
      // });

      //db.webhook.save(data);


    }
  }
};