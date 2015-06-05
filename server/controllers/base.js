// This is the base controller. Used for base routes, such as the default index/root path, 404 error pages, and others.
require('dotenv').load();
var collections = ['deals'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);
var swig = require('swig');
var _ = require('underscore');
//var raccoon = require('raccoon');
//raccoon.config.nearestNeighbors = 10; // number of neighbors you want to compare a user against
//raccoon.config.className = 'deal'; // prefix for your items (used for redis)
//raccoon.config.numOfRecsStore = 30; // number of recommendations to store per user
//raccoon.connect(process.env.REDIS_PORT, process.env.REDIS_URL, process.env.REDIS_AUTH);
var numeral = require('numeral');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);


function getUsers(cb) {
    var params = {
        where: {
            points: {
                "$gte": 500
            }
        }
    };

    kaiseki.getUsers(function(err, res, body, success) {
        cb(body);
    });
}

module.exports = {
    index: {
        handler: function(request, reply) {

            var saved_deals = [];

            db.deals.count(function(error, count) {
                getUsers(function(users) {

                    users.forEach(function(user) {
                        saved_deals.push(user.saved_deal);
                    });

                    var flatSaved = _.flatten(saved_deals);
                    var uniqueSaved = _.uniq(flatSaved);

                    //  raccoon.mostLiked(function(results) {
                    reply.view('index', {
                        title: 'Local deals discovery app - DEALSBOX'
                    });
                    //  });

                });
            });


        },
        app: {
            name: 'index'
        }
    },
    fbconfirm: {
        handler: function(request, reply) {
            reply.view('fbconfirm', {
                title: 'Thank you'
            });
        },
        app: {
            name: 'fbconfirm'
        }
    },
    missing: {
        handler: function(request, reply) {
            reply.view('404', {
                title: 'You found a missing page, but won the 404 error!'
            }).code(404);
        },
        app: {
            name: '404'
        }
    }
};