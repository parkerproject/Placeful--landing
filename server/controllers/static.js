// This is the base controller. Used for base routes, such as the default index/root path, 404 error pages, and others.
module.exports = {
  index: {
    handler: function (request, reply) {
      // Render the view with the custom greeting
      reply.view('how-it-works');
    },
    app: {
      name: 'index'
    }
  },

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
  points: {
    handler: function (request, reply) {
      // Render the view with the custom greeting
      reply.view('how-to-earn-points');
    },
    app: {
      name: 'points'
    },

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
      // Render the view with the custom greeting
      reply.view('alerts');
    },
    app: {
      name: 'alerts'
    },

  }
};