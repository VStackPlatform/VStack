requirejs.config({
    paths: {
        'text': '../lib/require/text',
        'durandal':'../lib/durandal/js',
        'plugins' : '../lib/durandal/js/plugins',
        'transitions' : '../lib/durandal/js/transitions',
        'knockout': '../node_modules/knockout/build/output/knockout-latest.debug',
        'bootstrap': '../node_modules/bootstrap/dist/js/bootstrap',
        'jquery': '../lib/jquery/jquery-1.9.1',
        'jquery-ui': '../lib/jquery-ui/jquery-ui.min',
        'bootstrap-checkbox': 'lib/bootstrap-checkbox/js/bootstrap-checkbox',
        'select2': '../node_modules/select2/select2.min',
        'ko-validation': '../node_modules/knockout.validation/dist/knockout.validation.min',
        'ko-mapping': '../node_modules/knockout.mapping/knockout.mapping',
        'ko-postbox': '../node_modules/knockout-postbox/build/knockout-postbox'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery'],
            exports: 'jQuery'
        }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'bootstrap'],  function (system, app, viewLocator) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    app.title = 'VStack';

    app.configurePlugins({
        router: true,
        dialog: true
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('shell', 'entrance');
    });
});