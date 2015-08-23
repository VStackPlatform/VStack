define([
    'knockout',
    'ko-validation',
    'ko-mapping',
    'lib/models/Vagrant',
    'lib/environment',
    'lib/virtualBox',
    'lib/models/Addon',
    'ko-postbox'
],
function(ko, validation, mapping, Vagrant, env, vb, Addon, postbox) {

    var db = openDatabase('vstack', '1.0', 'VStack', 2 * 1024 * 1024);
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
            this.status = ko.observable(data.status || 'unknown');

            this.statusCss = ko.computed(function() {
                var color = 'active';
                switch (this.status()) {
                    case 'running':
                    case 'active':
                        return 'success';
                        break;
                    case 'poweroff':
                        return 'warning';
                        break;
                }
                return color;
            }, this);

            this.editUrl = ko.computed(function () {
                if (!this.isNewRecord) {
                    return '#project/edit/' + this.id();
                } else {
                    return '#project';
                }
            }, this);

            this.fullPath = ko.computed(function () {
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

        } catch (e) {
            console.error(e.stack);
        }
    };

    Project.prototype.validate = function() {
        var group = validation.group([this.name, this.path]);
        group.showAllMessages();
        return group().length == 0;
    };

    /**
     * Create the project.
     *
     * @param {boolean} [validate=true] validate
     */
    Project.prototype.save = function(validate) {
        try {
            validate = validate == undefined ? true : validate;
            if (!validate || this.validate()) {
                this._db.transaction(function (tx) {
                    Addon.findEnabled().then(function(addons) {
                        addons.forEach(function (addon) {
                            if (this.settings[addon.name] == undefined) {
                                this.settings[addon.name] = mapping.toJS(addon.data());
                            }
                        }.bind(this));
                    });
                    var settings = ko.toJSON(this.settings());
                    if (this.isNewRecord) {
                        tx.executeSql("INSERT INTO project (name, path, version, settings) VALUES (?, ?, ?, ?)", [
                            this.name(),
                            this.path(),
                            this.version(),
                            settings
                        ]);
                    } else {
                        tx.executeSql("UPDATE project SET name=?, path=?, version=?, settings=? WHERE rowid = ?", [
                            this.name(),
                            this.path(),
                            this.version(),
                            settings,
                            this.id()
                        ]);
                    }
                }.bind(this));
                return true;
            }
        } catch (e) {
            console.error(e.stack);
        }
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
    Project.prototype.findAll = function() {
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

    /**
     * Sets the vagrant status of the project. e.g running etc
     */
    Project.prototype.updateStatus = function() {
        var fullPath = this.fullPath();
        vagrant.getStatus(fullPath).then(function(result) {
            this.status(result);
        }.bind(this));
    };

    Project.prototype.up = function(machine) {
        switch (machine) {
            case 'Digital Ocean':
                vagrant.installPlugin('vagrant-digitalocean', this.fullPath(), function() {
                    vagrant.addBox(
                        'dummy',
                        'https://github.com/smdahlen/vagrant-digitalocean/raw/master/box/digital_ocean.box',
                        this.fullPath(),
                        function() {
                            vagrant.up(this.fullPath(), this.updateStatus.bind(this), ['--provider=digital_ocean']);
                        }.bind(this)
                    );
                }.bind(this));
                break;
            default:
                vagrant.up(this.fullPath(), this.updateStatus.bind(this));
                break;
        }
    };

    Project.prototype.provision = function () {
        vagrant.provision(this.fullPath(), this.updateStatus.bind(this));
    };
    Project.prototype.reload = function () {
        vagrant.reload(this.fullPath(), this.updateStatus.bind(this));
    };
    Project.prototype.halt = function () {
        vagrant.halt(this.fullPath(), this.updateStatus.bind(this));
    };
    Project.prototype.destroy = function () {
        vagrant.destroy(this.fullPath(), this.updateStatus.bind(this));
    };

    /**
     * Deletes the project.
     */
    Project.prototype.delete = function() {
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

    return Project;
});