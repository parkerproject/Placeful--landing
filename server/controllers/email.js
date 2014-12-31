require('dotenv').load();
var collections = ['early_access'];
var db = require("mongojs").connect(process.env.DEALSBOX_MONGODB_URL, collections);

function saveEmail(email, reply) {
    db.early_access.save({
        email: email
    }, function(err, success) {
        console.log(success);
        if (err) reply('<span class="error">oops! looks like the server failed. Try again</span>');
        if (success) reply(1);
    });

}

module.exports = {
    storeEmail: {
        handler: function(request, reply) {
            var email = request.params.email;
            db.early_access.findOne({
                email: email
            }, function(err, result) {
                if (err) console.log(err);
                if (result) {
                    reply('You have already submitted your email.');
                } else {
                    saveEmail(email, reply);
                }
            });


        },
        app: {
            name: 'storeEmail'
        }
    }

};