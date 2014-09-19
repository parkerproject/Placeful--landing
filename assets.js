// assets to be used by the 'hapi-assets' module based on process.env.NODE_ENV
module.exports = {
    development: {
        js: ['js/scripts.js'],
        css: ['css/devices.min.css','css/fonts.css', 'css/styles.css']
    },
    production: {
        js: ['js/scripts.min.js'],
        css: ['css/styles.min.css']
    }
};

