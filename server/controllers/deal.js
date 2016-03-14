'use strict'
require('dotenv').load()
const req = require('request')
const collections = ['promotions']
const db = require('mongojs').connect(process.env.DEALSBOX_MONGODB_URL, collections)

module.exports = {
  index: {
    handler: function (request, reply) {
      req('http://api.placeful.co/promotion?key=' + process.env.API_KEY + '&promotion_id=' + request.params.promotion_id, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let deal = JSON.parse(body)
          let facebook_url = 'http://placeful.co/deal/' + request.params.deal_id

          let tags = deal[0].tags
          let hashtags = tags.map(function (tag) {
            return '#' + tag
          })

          hashtags = hashtags.join(' ')

          reply.view('deal', {
            deal: deal[0],
            facebook_url: facebook_url,
            facebook_image_url: deal[0].large_image,
            tags: hashtags
          })

        }
      })
    }
  }
}