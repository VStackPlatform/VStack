define(
    [
        'plugins/router',
        'knockout',
        'ko-validation',
        'lib/Project',
        'lib/ProjectBuilder',
        'modules/SideNav',
        'modules/Header',
        'ko-mapping',
        'ko-postbox',
        'bindings/fadeaway'
    ],
    function(router, ko, validation, Project, ProjectBuilder, SideNav, Header, mapping) {

    var childRouter = router.createChildRouter();
    var app = requirejs('durandal/app');
    var q = require('q');

    var obj = {
        displayName: 'Welcome to the VStack.',
        router: childRouter
    };

    obj.createProject = function() {
        if (this.project().validate()) {
            var fullPath = this.project().fullPath();
            var settings = mapping.toJS(this.project().settings());
            delete (settings.__ko_mapping__);
            console.log(settings);
            var builder = new ProjectBuilder(this.project().name(), fullPath, settings);
            builder.createProjectDirectory()
                .then(
                function () {
                    return q.all([
                        builder.copyHiera(),
                        builder.createVagrantFile(),
                        builder.createPuppetFiles(),
                        builder.copyFiles()
                    ]);
                },
                function (err) {
                    throw new Error(err);
                }
            )
            .catch(function (err) {
                switch (err.message) {
                    case 'user cancelled':
                        // Do nothing as expected.
                        break;
                    default:
                        app.showMessage(
                            err.message,
                            'Project Creation Failure'
                        );
                        break;
                }
            })
            .finally(function () {
                console.log('success...');
                if (obj.project().save()) {
                    obj.project(new Project());
                    router.navigate('#projects');
                }
            });
        }
    };

    obj.setPath = function(model, event) {
        obj.project().path($(event.currentTarget).val());
    };

    obj.project = ko.observable(new Project()).syncWith('project.main', true);

    obj.allowCopy = ko.observable(false).syncWith('project.allowCopy', true);

    obj.saveText = ko.computed(function() {
        return obj.project().isNewRecord ? 'Create Project' : 'Update Project';
    }, obj);

    obj.resetNavigation = function() {
        childRouter.reset();
        var childRouterMap = [
            {route: ['local'], moduleId: 'target/local/index', title: 'Locally', nav: true, type: 'target', 'hash': '#local'},
            {route: ['do'], moduleId: 'target/do/index', title: 'Digital Ocean', nav: true, type: 'target', 'hash': '#do'},
            {route: ['packages'], moduleId: 'system/packages/index', title: 'Packages', nav: true, type: 'system', 'hash': '#packages'},
            {route: ['users'], moduleId: 'system/users/index', title: 'Users & Groups', nav: true, type: 'system', 'hash': '#users'},
            {route: ['apache'], moduleId: 'webserver/apache/index', title: 'Apache', nav: true, type: 'webServer', 'hash': '#apache'},
            {route: ['php'], moduleId: 'language/php/index', title: 'PHP', nav: true, type: 'language', 'hash': '#php'},
            {route: ['ruby'], moduleId: 'language/ruby/index', title: 'Ruby', nav: true, type: 'language', 'hash': '#ruby'},
            {route: ['nodejs'], moduleId: 'language/nodejs/index', title: 'NodeJS', nav: true, type: 'language', 'hash': '#nodejs'},
            {route: ['mysql'], moduleId: 'database/mysql/index', title: 'MySQL', nav: true, type: 'database', 'hash': '#mysql'},
            {route: ['redis'], moduleId: 'database/redis/index', title: 'Redis', nav: true, type: 'database', 'hash': '#redis'}
        ];

        // Push default routes depending on selection.
        switch (obj.project().settings().target.type()) {
            case 'do':
                childRouterMap[1].route.push('');
                break;
            case 'locally':
            default:
                childRouterMap[0].route.push('');
                break;
        }

        childRouter.makeRelative({
            moduleId: 'project',
            fromParent: true,
            dynamicHash: ':id'
        })
        .map(childRouterMap)
        .buildNavigationModel();

        obj.header = new Header();
        obj.sideNav = new SideNav(childRouter);
    };

    obj.disableExisting = ko.computed(function() {
        if (!obj.project().isNewRecord) {
            return {
                disabled: 'disabled'
            };
        }
        return {};
    });

    obj.canActivate = function(id) {

        // Force any navigation that is not a number
        if (isNaN(id)) {
            return { redirect: '#project' };
        } else {
            // only reset if change in project.
            if (obj.project().id() != id) {
                return obj.project().find(id).then(function (project) {
                    if (project !== null) {
                        obj.project(project);
                        return true;
                    } else {
                        return {redirect: '#project'};
                    }
                });
            } else {
                return true;
            }
        }
    };

    obj.activate = function(id) {
        obj.resetNavigation();
    };

    return obj;
});

