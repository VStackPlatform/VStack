define([
    'knockout',
    'ko-validation',
    'ko-mapping',
    'lib/models/Vagrant',
    'lib/environment',
    'lib/projectTemplate',
    'lib/virtualBox',
    'addons/apache/lib/models/VirtualHost',
    'addons/mysql/lib/models/User',
    'addons/nginx/lib/models/Site',
    'lib/models/Addon'
],
function(ko, validation, mapping, Vagrant, env, template, vb, VirtualHost, MySQLUser, Site, Addon) {

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
            this._db.transaction(function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS project (name, path, settings, version)");
            });
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

            var jsonMap = {
                'nginx_options': {
                    create: function (options) {
                        return new function () {
                            mapping.fromJS(options.data, {
                                'sites': {
                                    "create": function (model) {
                                        if (model.data.site_name == undefined) {
                                            model.data.site_name = '';
                                        }
                                        return new Site(model.data);
                                    }
                                }
                            }, this);
                            this.toJSON = function() {
                                return mapping.toJS(this);
                            };
                        };
                    }
                },
                'ini_settings': {
                    create: function (options) {
                        return ko.observable(options.data);
                    }
                },
                'settings': {
                    create: function (options) {
                        return ko.observable(options.data);
                    }
                }
            };

            if (data.settings !== undefined) {
                var settings = mapping.fromJS(template, jsonMap);
                mapping.fromJS(mapping.fromJSON(data.settings), jsonMap, settings);
                this.settings = ko.observable(settings);
            } else {
                this.settings = ko.observable(mapping.fromJS(template, jsonMap));
            }

            var requiredValidate = function (target) {
                return {
                    required: {
                        onlyIf: function () {
                            return this.settings().target.type() == target;
                        }.bind(this)
                    }
                };
            }.bind(this);

            this.targetMachine = ko.computed(function () {
                return this.settings().target.type() == 'locally' ? 'Virtualbox' : 'Digital Ocean';
            }, this);


            this.name.extend({
                required: true,
                nameExists: {
                    onlyIf: function () {
                        return this.isNewRecord == 1;
                    }.bind(this)
                },
                vbExists: {
                    onlyIf: function () {
                        if (this.isNewRecord == 1) {
                            return this.settings().target.type() == 'locally' &&
                                this.targetMachine() == 'Virtualbox';
                        } else {
                            return false;
                        }
                    }.bind(this)
                }
            });

            this.settings().target.local_options.ip.extend(requiredValidate('locally'));
            this.settings().target.local_options.hostname.extend(requiredValidate('locally'));
            this.settings().target.local_options.memory.extend(requiredValidate('locally'));
            this.settings().target.local_options.cpu_count.extend(requiredValidate('locally'));
            this.settings().target.do_options.server_name.extend(requiredValidate('do'));
            this.settings().target.do_options.token.extend(requiredValidate('do'));
            this.settings().target.do_options.ssh_key_name.extend(requiredValidate('do'));
            this.settings().target.do_options.private_key_path.extend(requiredValidate('do'));
            this.settings().target.do_options.private_key_user.extend(requiredValidate('do'));
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
                    var settings = mapping.toJSON(this.settings());
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
            console.log(error);
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

    Project.prototype.up = function() {
        switch (this.targetMachine()) {
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