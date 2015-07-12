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
            loading: ko.observable(true),
            projects: ko.observableArray(),
            activate: function () {
                project.findAll().then(function (results) {
                    obj.projects(results);
                    for (var i in obj.projects()) {
                        (function(current) {
                            setTimeout(function() {
                                obj.projects()[current].updateStatus();
                            }, Math.random() * 10000);
                        })(i);
                    }
                }, function (error) {
                    console.error(error);
                }).then(function() {
                    obj.loading(false);
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
            }
        };

        obj.commandRunning = ko.observable().syncWith('vagrant.commandRunning', true);

        return obj;
    } catch (e) {
        console.error(e.stack);
    }
});