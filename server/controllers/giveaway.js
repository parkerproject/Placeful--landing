require('dotenv').load();
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var _ = require('underscore');
var CronJob = require('cron').CronJob;


function getUsers(cb) {
    var params = {
        where: {
            points: {
                "$gte": 500
            }
        }
    };

    kaiseki.getUsers(params, function(err, res, body, success) {
        cb(body);
    });
}

// function isLastDay(dt) {
//     var test = new Date(dt.getTime());
//     test.setDate(test.getDate() + 1);
//     return test.getDate() === 1;
// }


// function resetPoints() {
//     var dt = new Date();
//     var status = isLastDay(dt); // checks if last day of month
//     var className = 'User';
//     var update = {
//         data: {
//             points: 0
//         }
//     };

//     if (status) {
//         kaiseki.updateObjects(className, update, function(err, res, body, success) {
//             console.log('status1');
//             for (var i = 0; i < body.length; i++) {
//                 object = body[i];
//                 console.log('objects updated = at ', object.updatedAt);
//             }
//         });
//     }

// }


// var job = new CronJob({
//     cronTime: '0-59', //'00 30 11 * * 1-7',
//     onTick: function() {
//         Runs every weekday (Monday through Friday)
//         at 11:30:00 AM. It does not run on Saturday
//         or Sunday.
//         getDeals();

//     },
//     start: false,
//     timeZone: "America/New_York"
// });
// job.start();

// function(obj){
//    var user = obj;

// }

module.exports = {
    index: {
        handler: function(request, reply) {
            getUsers(function(body) {
                var users = _.shuffle(body);
                var fiveUsers = _.sample(users, 5);

                reply(fiveUsers);
            });

        },
        app: {
            name: 'index'
        }
    }
};