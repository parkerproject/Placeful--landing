require('dotenv').load();
var _request = require('request'),
api_key = 'psaygy',
url = 'http://api.sqoot.com/v2/categories?api_key=',
request_JSON = {
  'message_status': "SUCCESS",
  'api_key_token': api_key_token,
  'api_secret_token': api_key_secret,
  'city_select': "New York City",
  'country_select': "United States",
  'sort_method': "bought"
},
		
uri_string = 'https://webapi.blipadeal.com/api_get_deals?request=' + JSON.stringify( request_JSON );

module.exports = {
  deals: {
    handler: function(request, reply) {

      _request(uri_string, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          reply(body);
        }
      });

    },
    app: {
      name: 'deals'
    }
  }

};