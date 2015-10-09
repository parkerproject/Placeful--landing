/**
 * Dependencies.
 */
var requireDirectory = require('require-directory');

module.exports = function (server) {
  // Bootstrap your controllers so you dont have to load them individually. This loads them all into the controller name space. https://github.com/troygoode/node-require-directory
  var controller = requireDirectory(module, '../controllers');

  // Array of routes for Hapi
  var routeTable = [{
    method: 'GET',
    path: '/fbconfirm',
    config: controller.base.fbconfirm
  }, {
    method: 'GET',
    path: '/',
    config: controller.base.index
  }, {
    method: 'GET',
    path: '/{path*}',
    config: controller.base.missing
  }, {
    method: 'GET',
    path: '/partials/{path*}',
    config: controller.assets.partials
  }, {
    method: 'GET',
    path: '/images/{path*}',
    config: controller.assets.images
  }, {
    method: 'GET',
    path: '/css/{path*}',
    config: controller.assets.css
  }, {
    method: 'GET',
    path: '/fonts/{path*}',
    config: controller.assets.fonts
  }, {
    method: 'GET',
    path: '/js/{path*}',
    config: controller.assets.js
  }, {
    method: 'GET',
    path: '/bower_components/{path*}',
    config: controller.assets.bower
  }, {
    method: 'GET',
    path: '/merchant/{path*}',
    config: controller.assets.merchant
  }, {
    method: 'POST',
    path: '/process_email/{email*2}',
    config: controller.email.storeEmail
  }, {
    method: 'POST',
    path: '/welcome_email/{user*2}',
    config: controller.email.welcomeEmail
  }, {
    method: 'GET',
    path: '/giveaway',
    config: controller.giveaway.index
  }, {
    method: 'GET',
    path: '/terms',
    config: controller.static.terms
  }, {
    method: 'GET',
    path: '/privacy',
    config: controller.static.privacy
  }, {
    method: 'GET',
    path: '/about',
    config: controller.static.about
  }, {
    method: 'GET',
    path: '/recommended',
    config: controller.prediction.like
  }, {
    method: 'GET',
    path: '/alerts',
    config: controller.static.alerts
  }, {
    method: 'GET',
    path: '/deals/feed.xml',
    config: controller.rss.main
  }, {
    method: 'GET',
    path: '/promo',
    config: controller.promo.testing
  }, {
    method: 'GET',
    path: '/business',
    config: controller.merchant.index
  }, {
    method: ['GET', 'POST'],
    path: '/business/login',
    config: controller.merchant.login
  }, {
    method: 'GET',
    path: '/business/logout',
    config: controller.merchant.logout
  }, {
    method: 'GET',
    path: '/business/register',
    config: controller.merchant.register
  }, {
    method: 'POST',
    path: '/business/register_post',
    config: controller.merchant.register_post
  }];
  return routeTable;
};