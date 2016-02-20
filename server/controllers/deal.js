require('dotenv').load()
var _ = require('lodash')
var req = require('request')
var collections = ['promotions']
var db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
  index: {
    handler: function (request, reply) {
      req('http://api.placeful.co/promotion?key=' + process.env.API_KEY + '&promotion_id=' + request.params.promotion_id, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body)
          var deal = JSON.parse(body)
          var facebook_image_url = 'http://imagify.co/img?url=' + deal[0].large_image + '&crop_width=200&crop_height=200'
          var facebook_url = 'http://placeful.co/deal/' + request.params.deal_id

          var tags = deal[0].tags
          var hashtags = tags.map(function (tag) {
            return '#' + tag
          })

          var hashtags = hashtags.join(' ')

          reply.view('deal', {
            deal: deal[0],
            facebook_url: facebook_url,
            facebook_image_url: facebook_image_url,
            tags: hashtags
          })

        }
      })

    }
  }
}