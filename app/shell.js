define(['plugins/router', 'durandal/app', 'knockout', 'modules/Term'], function (router, app, ko, Term) {

    return {
        router: router,
        activate: function () {
            router.map([
                { route: ['projects'], title:'Projects', moduleId: 'project/list', nav: 2 },
                { route: ['project/edit/:id*details'], title:'Existing Project', moduleId: 'project/edit', nav: false},
                { route: ['', 'project*details'], title:'New Project', moduleId: 'project/index', nav: 1, hash: '#project' },
                { route: ['addons'], title: 'Addons', moduleId: 'addons/index', nav: 3 }
            ]).buildNavigationModel();
            
            return router.activate();
        },
        term: new Term('main')
    };
});