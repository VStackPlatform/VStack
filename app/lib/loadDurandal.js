define([
    'durandal/system',
    'durandal/app',
    'durandal/viewLocator',
    'bootstrap',
    'app-lib/taskMenu',
    'extensions/asyncComputed',
    'ko-es5'
],
function (system, app, viewLocator) {

    var gui = require('nw.gui');
    var q = require('q');
    var deferred = q.defer();
    var win = gui.Window.get();
    win.showDevTools('', true);

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

        deferred.resolve(true);

    });
    return deferred.promise;
});