var Hapi = require('hapi');
var server = new Hapi.Server(1100);

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});


server.start(function () {
    console.log('Server running at:', server.info.uri);
});