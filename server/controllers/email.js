require('dotenv').load();
var Kaiseki = require('kaiseki');
var kaiseki = new Kaiseki(process.env.PARSE_APP_ID, process.env.PARSE_REST_API_KEY);
var className = 'emails';

module.exports = {
    storeEmail: {
        handler: function(request, reply) {

            var emails = [{
                email: request.params.email
            }]

            var params = {
                where: {
                    email: request.params.email
                }
            };

            kaiseki.getObjects(className, params, function(err, res, body, success) {
                if (body.length === 0) {
                    kaiseki.createObjects(className, emails, function(err, res, body, success) {
                        if (success) {
                            reply('Thanks for signing up. We can\'t wait to launch this.');
                        } else {
                            reply('oops! looks like the server failed. Try again');
                        }

                    });
                } else {
                    reply('You have already signup!');
                }
            });


        },
        app: {
            name: 'storeEmail'
        }
    }

};