define([
    'knockout',
    'ko-validation',
    'ko-mapping',
    'app-lib/models/Vagrant',
    'app-lib/environment',
    'app-lib/virtualBox',
    'app-lib/models/Addon',
    'ko-postbox',
    'app-lib/vstack'
],
function(ko, validation, mapping, Vagrant, env, vb, Addon, postbox, vstack) {

    var db = vstack.db;
    var q = require('q');
    var vagrant = new Vagrant();

    validation.init({
        insertMessages: false,
        grouping: { deep: true, observable: true, live: false }
    });

    ko.validation.rules['nameExists'] = {
        async: true,
        validator: function (val, otherVal, callback) {
            db.transaction(function (tx) {
                tx.executeSql('SELECT rowid FROM project WHERE name = ?', [val], function (tx, results) {
                    callback(results.rows.length == 0);
                });
            });
        },
        message: 'This project name already exists.'
    };

    ko.validation.rules['vbExists'] = {
        async: true,
        validator: function (val, otherVal, callback) {
            vb.vmNames().then(function(names) {
                callback(names.indexOf(val) == -1);
            });
        },
        message: 'This name already exists in virtualbox.'
    };

    ko.validation.registerExtenders();

    /**
     * The project model.
     *
     * @param {object} [data={}] data
     * @constructor
     */
    var Project = function(data) {
        try {
            data = data || {};
            this.isNewRecord = typeof data.id == 'undefined';
            this.id = ko.observable(data.id || undefined);

            this._db = db;
            this.name = ko.observable(data.name || undefined);
            this.path = ko.observable(data.path || undefined).extend({
                required: true
            });
            this.version = ko.observable(data.version || '1.0');
            this.statuses = ko.observableArray();

            /**
             * Returns the edit url.
             */
            this.editUrl = ko.pureComputed(function () {
                if (!this.isNewRecord) {
                    return '#project/edit/' + this.id();
                } else {
                    return '#project';
                }
            }, this);

            /**
             * Returns the full path to the project.
             */
            this.fullPath = ko.pureComputed(function () {
                return this.path() + env.pathSeparator() + this.name();
            }, this);

            this.settings = ko.observable({});

            if (data.settings !== undefined) {
                this.settings(JSON.parse(data.settings));
            }

            this.name.extend({
                required: true,
                nameExists: {
                    onlyIf: function () {
                        return this.isNewRecord == 1;
                    }.bind(this)
                }
            });

            /**
             * Validates the project.
             *
             * @returns {boolean}
             */
            this.validate = function() {
                var group = validation.group([this.name, this.path]);
                group.showAllMessages();
                return group().length == 0;
            };

            /**
             * Create the project.
             *
             * @param {boolean} [validate=true] validate
             */
            this.save = function(validate) {
                var deferred = q.defer();
                try {
                    validate = validate == undefined ? true : validate;
                    if (!validate || this.validate()) {

                            Addon.findEnabled().then(function(addons) {
                                addons.forEach(function (addon) {
                                    if (this.settings[addon.name] == undefined) {
                                        this.settings[addon.name] = mapping.toJS(addon.data());
                                    }
                                }.bind(this));
                                var settings = ko.toJSON(this.settings());
                                try {
                                    if (this.isNewRecord) {
                                        this._db.transaction(function (tx) {
                                            tx.executeSql("INSERT INTO project (name, path, version, settings) VALUES (?, ?, ?, ?)", [
                                                this.name(),
                                                this.path(),
                                                this.version(),
                                                settings
                                            ], function () {
                                                deferred.resolve(true);
                                            }, function () {
                                                deferred.resolve(false);
                                            });
                                        }.bind(this));
                                    } else {
                                        this._db.transaction(function (tx) {
                                            tx.executeSql("UPDATE project SET name=?, path=?, version=?, settings=? WHERE rowid = ?", [
                                                this.name(),
                                                this.path(),
                                                this.version(),
                                                settings,
                                                this.id()
                                            ], function () {
                                                deferred.resolve(true);
                                            }, function () {
                                                deferred.resolve(false);
                                            });
                                        }.bind(this));
                                    }
                                }
                                catch (e) {
                                    console.error(e.stack);
                                }

                        }.bind(this));
                    } else {
                        deferred.resolve(false);
                    }
                } catch (e) {
                    console.error(e.stack);
                    deferred.resolve(false);
                }
                return deferred.promise;
            };

            /**name
             * Updates the status of the project.
             *
             * @param project
             */
            this.updateStatus = function(project) {
                project = project || this;
                Addon.findByType('Target', false).then(function(targets) {
                    targets.forEach(function (target) {
                        if (project.settings()[target.name] !== undefined &&
                            project.settings()[target.name].install == true) {
                            vagrant.getStatus(project.fullPath(), target.name)
                                .then(function (result) {
                                    project.statuses().forEach(function(value, key) {
                                        if (target.name === value().name) {
                                            project.statuses()[key]({
                                                name: target.name,
                                                title: target.title,
                                                status: result,
                                                command: true
                                            });
                                        }
                                    });
                                })
                                .catch(function(error) {
                                    project.statuses()[key]({
                                        name: target.name,
                                        title: target.title,
                                        status: error,
                                        command: false
                                    });
                                });
                        }
                    });
                });
            };

            /**
             * Fetches a single row as a Project model.
             *
             * @param {int} id The rowid for the project.
             * @returns {object} The Project model.
             */
            Project.prototype.find = function(id) {
                var deferred = q.defer();
                this._db.transaction(function (tx) {
                    tx.executeSql('SELECT rowid as id, * FROM project WHERE rowid = ?', [id], function (tx, results) {
                        if (results.rows.length > 0) {
                            var row = results.rows.item(0);
                            var model = new Project(row);
                        }
                        deferred.resolve(model || null);
                    });
                }, function(error) {
                    console.error(error);
                });
                return deferred.promise;
            };

            /**
             * Fetches all projects as models.
             *
             * @returns {array} An array of Project models.
             */
            this.findAll = function() {
                var deferred = q.defer();
                this._db.transaction(function (tx) {
                    tx.executeSql('SELECT rowid as id,* FROM project', [], function (tx, results) {
                        var len = results.rows.length, i, data = [];
                        for (i = 0; i < len; i++) {
                            var row = results.rows.item(i);
                            var project = new Project(row);
                            data.push(project);
                        }
                        deferred.resolve(data);
                    });
                });
                return deferred.promise;
            };

            this.up = function(model) {
                switch (model.name) {
                    case 'digitalocean':
                        vagrant.installPlugin('vagrant-digitalocean', this.fullPath(), function() {
                            vagrant.addBox(
                                'dummy',
                                'https://github.com/smdahlen/vagrant-digitalocean/raw/master/box/digital_ocean.box',
                                this.fullPath(),
                                function() {
                                    vagrant.up(this.fullPath(), model.name, this.updateStatus.bind(this), ['--provider=digital_ocean']);
                                }.bind(this)
                            );
                        }.bind(this));
                        break;
                    default:
                        vagrant.up(this.fullPath(), model.name, this.updateStatus.bind(this));
                        break;
                }
            }.bind(this);

            this.provision = function (model) {
                vagrant.provision(this.fullPath(), model.name, this.updateStatus.bind(this));
            }.bind(this);
            this.reload = function (model) {
                vagrant.reload(this.fullPath(), model.name, this.updateStatus.bind(this));
            }.bind(this);
            this.halt = function (model) {
                vagrant.halt(this.fullPath(), model.name, this.updateStatus.bind(this));
            }.bind(this);
            this.destroy = function (model) {
                vagrant.destroy(this.fullPath(), model.name, this.updateStatus.bind(this));
            }.bind(this);

            /**
             * Deletes the project.
             */
            this.delete = function() {
                var self = this;
                if (!this.isNewRecord) {
                    var deferred = q.defer();
                    this._db.transaction(function (tx) {
                        tx.executeSql('DELETE FROM project WHERE rowid = ?', [self.id()], function (tx, results) {
                            deferred.resolve(results);
                        });
                    });
                    return deferred.promise;
                }
            };

        } catch (e) {
            console.error(e.stack);
        }
    };

    return Project;
});