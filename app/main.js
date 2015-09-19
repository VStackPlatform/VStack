requirejs.config({
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
        'v-config': './lib/config'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        }
    }
});

define(['app-lib/loadDurandal']);