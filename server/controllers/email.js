require('dotenv').load();
var collections = ['early_access'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);

module.exports = {
    storeEmail: {
        handler: function(request, reply) {
            var email = request.params.email;
            db.early_access.update({
                email: email
            }, {
                email: email
            }, {
                upsert: true
            }, function(err, success) {
                if (err) console.log(err);
                if (success) {
                    reply('Thanks for signing up for early access, We shall be in touch soon.');
                } else {
                    reply('<span class="error">oops! looks like the server failed. Try again</span>');

                }
            });


        },
        app: {
            name: 'storeEmail'
        }
    }

};