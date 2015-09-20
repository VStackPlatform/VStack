// Karma configuration
// Generated on Tue Jun 30 2015 15:27:15 GMT+1000 (AEST)

module.exports = function(config) {
    config.set({

        basePath: '',

        browsers: ['NodeWebkitCustom'],

        customLaunchers: {
            'NodeWebkitCustom': {
                base: 'NodeWebkit',
                options: {
                    "name": "vstack_test",
                    "path": __dirname,
                    "window": {
                        "width": 1400,
                        "height": 1200,
                        "icon": "images/stack.png"
                    }
                }
            }
        },

        preprocessors: {
            'app/!(test)/**/*.js': 'coverage'
        },

        reporters: ['coverage'],

        coverageReporter: {
            type : 'html',
            dir : 'coverage/',
            includeAllSources: true
        },

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine-jquery', 'requirejs', 'jasmine-ajax', 'jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'css/bootstrap-ext.css',
            'node_modules/font-awesome/css/font-awesome.min.css',
            'css/ie10mobile.css',
            'node_modules/durandal/css/durandal.css',
            'css/awesome-bootstrap-checkbox.css',
            'node_modules/select2/select2.css',
            'node_modules/select2/select2-bootstrap.css',
            'node_modules/jquery-ui-bundle/jquery-ui.css',
            'css/starterkit.css',
            {pattern: 'app/**/*.html', included: false},
            {pattern: 'app/**/*.json', included: false},
            {pattern: 'app/**/*.js', included: false},
            {pattern: 'images/**/*', included: false},
            {pattern: 'node_modules/font-awesome/fonts/*', included: false},
            {pattern: 'node_modules/durandal/node_modules/jquery/dist/jquery.js', included: false},
            {pattern: 'node_modules/jquery-ui-bundle/**/*', included: false},
            {pattern: 'node_modules/durandal/**/*', included: false},
            {pattern: 'node_modules/knockout-es5/dist/**/*', included: false},
            {pattern: 'node_modules/knockout/build/**/*', included: false},
            {pattern: 'node_modules/knockout.mapping/**/*', included: false},
            {pattern: 'node_modules/knockout-postbox/build/**/*', included: false},
            {pattern: 'node_modules/knockout.validation/dist/**/*', included: false},
            {pattern: 'node_modules/knockout-dragdrop/lib/knockout.dragdrop.js', included: false},
            {pattern: 'node_modules/bootstrap/dist/**/*', included: false},
            {pattern: 'node_modules/requirejs-text/text.js', included: false},
            {pattern: 'node_modules/select2/select2.js', included: false},
            {pattern: 'node_modules/q/**/*', included: false},
            {pattern: 'node_modules/ncp/**/*', included: false},
            {pattern: 'node_modules/handlebars/**/*', included: false},
            'app/test-main.js'
        ],
        exclude: [
            'app/main.js'
        ],
        proxies: {
            '/images/': '/base/images/'
        }
    });
}