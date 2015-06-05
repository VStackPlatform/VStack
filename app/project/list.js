/**
 * Created by damian on 9/05/15.
 */
define([
    'plugins/router',
    'shell',
    'knockout',
    'lib/Project',
    'ko-postbox',
    'ko-mapping',
    'lib/Vagrant'
], function(
    router,
    shell,
    ko,
    Project,
    postbox,
    mapping,
    Vagrant
) {
    try {
        var project = new Project();
        var vagrant = new Vagrant();

        var obj = {
            projects: ko.observableArray(),
            activate: function () {
                project.findAll().then(function (results) {
                    obj.projects(results);
                    for (var i in obj.projects()) {
                        obj.projects()[i].updateStatus();
                    }
                }, function (error) {
                    console.error(error);
                });
            },
            copyProject: function (model, event) {
                var settings = mapping.toJSON(model.settings());
                var copyModel = new Project({
                    name: model.name(),
                    path: model.path(),
                    settings: settings
                });
                postbox.publish('project.main', copyModel);
                postbox.publish('project.allowCopy', true);
                router.navigate('#project');
            },
            deleteProject: function (model, event) {
                model.delete().then(function () {
                    project.findAll().then(function (result) {
                        obj.projects(result);
                    }, function (error) {
                        console.error(error);
                    });
                });
            },
            up: function (model, event) {
                vagrant.up(model.fullPath());
            },
            provision: function (model, event) {
                vagrant.provision(model.fullPath());
            },
            reload: function (model, event) {
                vagrant.reload(model.fullPath());
            },
            halt: function (model, event) {
                vagrant.halt(model.fullPath());
            },
            destroy: function (model, event) {
                vagrant.destroy(model.fullPath());
            }
        };

        obj.commandRunning = ko.observable().syncWith('vagrant.commandRunning', true);

        return obj;
    } catch (e) {
        console.error(e.stack);
    }
});