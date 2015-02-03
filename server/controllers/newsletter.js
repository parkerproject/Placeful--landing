require('dotenv').load();
var swig = require('swig');
var rp = require('request-promise');
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var _ = require('underscore');
var mandrill = require('node-mandrill')(process.env.MANDRILL);
var CronJob = require('cron').CronJob;


function sendEmails(email, subject, content) {
    mandrill('/messages/send', {
        message: {
            to: [{
                email: email
            }],
            from_email: 'no-reply@dealsbox.co',
            subject: subject,
            html: content
        }
    }, function(error, response) {
        //uh oh, there was an error
        if (error) console.log(JSON.stringify(error));

        //everything's good, lets see what mandrill said
        else console.log(response);
    });
}


function buildTemplate(deals, cb) {
    swig.renderFile(__base + 'server/views/newsletter.html', {
            deals: JSON.parse(deals)
        },
        function(err, content) {
            if (err) {
                throw err;
            }
            cb(content);
        });

}



function endpoint(city) {
    return 'http://api.dealsbox.co/deals?limit=20&city=' + city;
}



function getUsers(cb) {
    var params = {
        where: {
            receive_newsletters: true
        }
    };

    kaiseki.getUsers(params, function(err, res, body, success) {
        cb(body);
    });
}



function groupUsers(cb) {
    var i, city, groups = {};
    getUsers(function(users) {

        for (i = 0; i < users.length; i++) {
            city = users[i].city;
            if (!(city in groups)) { //check if groups already has city property

                groups[city] = [];

            }

            groups[city].push(users[i]);
        }
        cb(groups);
    });
}




function getDeals() {

    groupUsers(function(groups) {

        var cityOfUsers = Object.keys(groups);

        for (var i = 0, len = cityOfUsers.length; i < len; i++) {
            var city = cityOfUsers[i];
            var url = endpoint(city);
            var emails = _.pluck(groups[city], 'email'); //grab all emails in this city
            var subject = 'Dealsbox daily digest';
            console.log(city, emails);

            (function(index, userEmails, _city) {
                rp(url)
                    .then(function(deals) {
                        for (var e = 0; e < userEmails.length; e++) {
                            // another closure with IIFE
                            (function(_index) {
                                buildTemplate(deals, function(content) {
                                    sendEmails(userEmails[_index], subject, content);
                                });

                            }(e));

                        }
                    })
                    .
                catch(console.error);

            }(i, emails, city));


        }

    });

}


var job = new CronJob({
    cronTime: '0-59', //'00 30 11 * * 1-7',
    onTick: function() {
        // Runs every weekday (Monday through Friday)
        // at 11:30:00 AM. It does not run on Saturday
        // or Sunday.
        //getDeals();

    },
    start: false,
    timeZone: "America/New_York"
});
job.start();

var providers = ['groupon', 'livingsocial', 'giltcity', 'travelzoo', 'sweetjack', 'pulsd', 'amazon local', 'lifebooker'];

function provider(source, cb) {
    rp('http://api.dealsbox.co/deals?category=Food%20%26%20Drinks&city=new%20york&limit=4&provider=' + source)
        .then(function(deals) {
            deals = JSON.parse(deals);
            cb(deals);
        })
        .catch(console.error);
}



module.exports = {
    newsletter: {}
	};