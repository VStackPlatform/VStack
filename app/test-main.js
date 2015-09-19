var TEST_REGEXP = /(spec|test)\.js$/i;
var allTestFiles = [];

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
        // then do not normalize the paths
        //var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
        allTestFiles.push(file);
    }
});

/*
 * @todo find a better way to do this.
 * Workaround copy across files needed to run tests.
 */
var gui = require('nw.gui');
var ncp = require('ncp');
ncp(gui.App.manifest.path + '/app', process.cwd() + '/app');
ncp(gui.App.manifest.path + '/lib', process.cwd() + '/lib');
ncp(gui.App.manifest.path + '/images', process.cwd() + '/images');

requirejs.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/app',

    // example of using a couple path translations (paths), to allow us to refer to different library dependencies, without using relative paths
    paths: {
        'text': '../node_modules/requirejs-text/text',
        'durandal':'../node_modules/durandal/js',
        'plugins' : '../node_modules/durandal/js/plugins',
        'transitions' : '../node_modules/durandal/js/transitions',
        'knockout': '../node_modules/knockout/build/output/knockout-latest.debug',
        'bootstrap': '../node_modules/bootstrap/dist/js/bootstrap',
        'jquery': '../node_modules/durandal/node_modules/jquery/dist/jquery',
        'jquery-ui': '../node_modules/jquery-ui-bundle/jquery-ui',
        'bootstrap-checkbox': '../node_modules/bootstrap-checkbox/dist/js/bootstrap-checkbox',
        'select2': '../node_modules/select2/select2',
        'ko-validation': '../node_modules/knockout.validation/dist/knockout.validation',
        'ko-mapping': '../node_modules/knockout.mapping/knockout.mapping',
        'ko-postbox': '../node_modules/knockout-postbox/build/knockout-postbox',
        'ko-dragdrop': '../node_modules/knockout-dragdrop/lib/knockout.dragdrop',
        'ko-es5': '../node_modules/knockout-es5/dist/knockout-es5',
        'app-lib': './lib',
        'v-config': 'test/config'
    },

    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: function() {
        requirejs(['jquery'], function($) {
            $('body').append(
                '<div id="applicationHost"> \
                <div class="splash"> \
                <div class="message"> \
                VStack \
                </div> \
                <i class="fa fa-spinner fa-spin"></i> \
                </div> \
                </div>'
            );
            requirejs(['app-lib/loadDurandal'], function (loadDurandal) {
                loadDurandal.then(function() {
                    window.__karma__.start();
                });
            });
        });
    }
});
