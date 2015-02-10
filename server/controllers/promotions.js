require('dotenv').load();
var collections = ['coupons'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var rp = require('request-promise');
var _ = require('underscore');
var mandrill = require('node-mandrill')(process.env.MANDRILL);

module.exports = {
  index: {
    handler: function(request, reply) {
      var code = request.params.code;
      db.coupons.findOne({
        code: code
      }, function(err, result) {
        if (err) console.log(err);
        if (result) {
          reply('Your code is AAA');
        } 
      });


    },
    app: {
      name: 'storeEmail'
    }
  }

};