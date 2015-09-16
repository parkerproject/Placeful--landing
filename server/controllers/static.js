// This is the base controller. Used for base routes, such as the default index/root path, 404 error pages, and others.
module.exports = {
  terms: {
    handler: function (request, reply) {
      // Render the view with the custom greeting
      reply.view('terms-conditions');
    },
    app: {
      name: 'terms'
    }
  },
  privacy: {
    handler: function (request, reply) {
      // Render the view with the custom greeting
      reply.view('privacy-policy');
    },
    app: {
      name: 'privacy'
    }
  },
  about: {
    handler: function (request, reply) {
      // Render the view with the custom greeting
      reply.view('about');
    },
    app: {
      name: 'about'
    },

  },
  alerts: {
    handler: function (request, reply) {

      var turnOn = request.query.turnon || 'false';
      if (turnOn === 'true') {
        reply.view('alerts');
      } else {
        reply('');
      }

    },
    app: {
      name: 'alerts'
    },

  }
};