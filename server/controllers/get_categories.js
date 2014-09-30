//var db = require('diskdb');
//db.connect('../data').loadCollections(['categories']);
//db = db.connect('./server/data', ['categories']);

var _request = require('request');
var Firebase = require('firebase');
var myRootRef = new Firebase('https://torid-torch-3616.firebaseio.com/deals/categories');

module.exports = {
    main: {
        handler: function(request, reply) {

            myRootRef.on('value', function(categories) {
                reply(categories.val());
            }, function(error) {
                reply(error.code);
            });

        },
        app: {
            name: 'getCategories'
        }
    }

};