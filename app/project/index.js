define([
    'plugins/router',
    'knockout',
    'ko-validation',
    'app-lib/models/Project',
    'app-lib/models/ProjectBuilder',
    'modules/Header',
    'modules/SideNav',
    'ko-mapping',
    'app-lib/models/Addon',
    'app-lib/environment',
    'ko-postbox',
    'bindings/fadeaway'
],
function(router, ko, validation, Project, ProjectBuilder, Header, SideNav, mapping, Addon, env, postbox) {

    var app = requirejs('durandal/app');
    var q = require('q');
    var fs = require('fs');

    var obj = {};
    obj.router =  router.createChildRouter();
    obj.project = ko.observable(new Project()).syncWith('project.main', true);
    obj.allowCopy = ko.observable(false).syncWith('project.allowCopy', true);
    obj.header = new Header();
    obj.saveText = 'Create Project';

    obj.createProject = function() {
        if (obj.project().validate()) {
            var fullPath = obj.project().fullPath();
            var settings = mapping.toJS(obj.project().settings());
            var builder = new ProjectBuilder(this.project().name(), fullPath, settings);
            builder.createProjectDirectory()
                .then(
                function () {
                    return q.all([
                        builder.copyHiera().catch(function(err) {
                            console.error(err);
                        }),
                        builder.createVagrantFile().catch(function(err) {
                            console.error(err);
                        }),
                        builder.createPuppetFiles().catch(function(err) {
                            console.error(err);
                        }),
                        builder.copyFiles().catch(function(err) {
                            console.error(err);
                        })
                    ]).catch(function(err) {
                        console.error(err);
                    });
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
                console.log('saving project...');
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


    obj.activate = function() {
        if (obj.project() == undefined || !obj.project().isNewRecord) {
            obj.project(new Project());
        }

        var menu = [];

        return Addon.findEnabled().then(function(addons) {

            addons.forEach(function(row, key) {
                var route = [row.name];
                if (key == 0) {
                    route.push('');
                }
                menu.push({
                    route: route,
                    moduleId: ['..', 'addons', row.name, 'index'].join(env.pathSeparator()),
                    title: row.title,
                    nav: true,
                    type: row.type
                });
                postbox.publish('addon.' + row.name, row);
            });
            obj.router.reset();
            obj.router.makeRelative({
                moduleId: 'project',
                fromParent: true
            })
            obj.router.map(menu);
            obj.router.buildNavigationModel(100);
            obj.sideNav = new SideNav(obj.router);
            return obj;
        });

    };

    obj.resetProject = function() {
        obj.project(new Project());
    };

    return obj;

});

