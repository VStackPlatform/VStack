define([
    'plugins/router',
    'shell',
    'knockout',
    'app-lib/models/Project',
    'ko-postbox',
    'ko-mapping',
    'app-lib/models/Vagrant',
    'app-lib/models/Addon'
], function(
    router,
    shell,
    ko,
    Project,
    postbox,
    mapping,
    Vagrant,
    Addon
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
                    Addon.findByType('Target', false).then(function(targets) {
                        obj.projects().forEach(function(project) {
                            targets.forEach(function (target) {
                                if (project.settings()[target.name] !== undefined &&
                                    project.settings()[target.name].install == true) {
                                    vagrant.getStatus(project.fullPath(), target.name)
                                        .then(function (result) {
                                            project.statuses.push({
                                                title: target.title,
                                                name: target.name,
                                                status: result,
                                                command: true
                                            });
                                        }).catch(function(error) {
                                            project.statuses.push({
                                                title: target.title,
                                                name: target.name,
                                                status: error,
                                                command: false
                                            });
                                        });
                                }
                            });
                        });
                    });
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