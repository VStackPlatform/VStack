define(
    [
        'plugins/router',
        'knockout',
        'ko-validation',
        'lib/Project',
        'lib/ProjectBuilder',
        'modules/Header',
        'modules/SideNav',
        'ko-mapping',
        'ko-postbox'
    ],
    function(router, ko, validation, Project, ProjectBuilder, Header, SideNav, mapping) {

    var childRouter = router.createChildRouter()
        .makeRelative({
            moduleId: 'project',
            fromParent: true
        })
        .map([
            {route: ['local', ''], moduleId: 'target/local/index', title: 'Locally', nav: true, type: 'target', hash: '#project/local'},
            {route: ['do'], moduleId: 'target/do/index', title: 'Digital Ocean', nav: true, type: 'target'},
            {route: ['packages'], moduleId: 'system/packages/index', title: 'Packages', nav: true, type: 'system'},
            {route: ['users'], moduleId: 'system/users/index', title: 'Users & Groups', nav: true, type: 'system'},
            {route: ['apache'], moduleId: 'webserver/apache/index', title: 'Apache', nav: true, type: 'webServer'},
            {route: ['php'], moduleId: 'language/php/index', title: 'PHP', nav: true, type: 'language'},
            {route: ['ruby'], moduleId: 'language/ruby/index', title: 'Ruby', nav: true, type: 'language'},
            {route: ['nodejs'], moduleId: 'language/nodejs/index', title: 'NodeJS', nav: true, type: 'language'},
            {route: ['mysql'], moduleId: 'database/mysql/index', title: 'MySQL', nav: true, type: 'database'},
            {route: ['redis'], moduleId: 'database/redis/index', title: 'Redis', nav: true, type: 'database'}
        ])
        .buildNavigationModel();

    var app = requirejs('durandal/app');
    var q = require('q');

    var obj = {
        router: childRouter
    };

    obj.project = ko.observable(new Project()).syncWith('project.main', true);
    obj.allowCopy = ko.observable(false).syncWith('project.allowCopy', true);
    obj.saveText = 'Create Project';
    obj.header = new Header();
    obj.sideNav = new SideNav(childRouter);

    obj.createProject = function() {
        if (obj.project().validate()) {
            var fullPath = obj.project().fullPath();
            var settings = mapping.toJS(obj.project().settings());
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

    obj.resetProject = function() {
        obj.project(new Project());
    };

    obj.setPath = function(model, event) {
        obj.project().path($(event.currentTarget).val());
    };

    obj.activate = function() {

        if (!obj.project().isNewRecord) {
            obj.project(new Project());
        }
    };

    return obj;
});

