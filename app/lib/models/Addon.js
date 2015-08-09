define([
    'plugins/router',
    'knockout',
    'ko-mapping',
    'lib/models/Class',
    'lib/environment',
    'lib/vstack',
    'ko-postbox'
],
function (router, ko, mapping, Class, env, vstack, postbox) {

    var fs = require('fs');
    var q = require('q');
    var colors = require('colors/safe');

    var Addon = Class.extend({
        init: function(data, dataMap) {
            this.identifier = 'Addon';
            if (typeof data == 'string') {
                this.initFromConfig(data, dataMap || {});
            } else {
                this.initFromArray(data, dataMap || {});
            }
        },
        initFromArray: function(data, dataMap) {

            this.dragging = ko.observable(false);
            this.project = ko.observable().syncWith('project.main', true);
            this.sideNavTypes = ko.observableArray().subscribeTo('project.sideNavTypes', true);
            var settings = this.project().settings()[this.name];

            if (settings !== undefined) {
                data.data = settings;
            }

            var addonMap = {
                'copy': ["id", "name", "title", "type", "version"],
                'data': {
                    create: function (options) {
                        if (typeof options.data == 'string') {
                            options.data = JSON.parse(options.data);
                        }
                        return ko.observable(new function () {
                            mapping.fromJS(options.data, dataMap, this);
                        });
                    }
                },
                'modules': {
                    create: function (options) {
                        if (typeof options.data == 'string') {
                            return JSON.parse(options.data);
                        } else {
                            return options.data;
                        }
                    }
                }
            };

            data.enabled = data.enabled || 0;
            data.data = data.data || {};
            data.modules = data.modules || {};

            mapping.fromJS(data, addonMap, this);

            //@todo: clean this up as this is a hacky bit of code.
            ko.computed(function() {
                this.sideNavTypes().forEach(function (menuItem, key) {
                    if (menuItem.name == this.type) {

                        var moduleKey = 0, moduleRoute;
                        menuItem.menu().forEach(function (item, index) {
                            if (item.route == this.name) {
                                moduleKey = index;
                                moduleRoute = item.route;
                            }
                        }.bind(this));

                        var project = this.project.peek();

                        if (menuItem.menu()[moduleKey - 1] !== undefined) {
                            this.prev = function () {
                                router.navigate(project.editUrl() + '/' + menuItem.menu()[moduleKey - 1].route);
                            };
                        } else if (this.sideNavTypes()[key - 1] != undefined) {
                            this.prev = function () {
                                router.navigate(project.editUrl() + '/' + this.sideNavTypes()[key - 1].menu().pop().route);
                            };
                        } else {
                            this.prev = undefined
                        }
                        if (menuItem.menu()[moduleKey + 1] !== undefined) {
                            this.next = function () {
                                router.navigate(project.editUrl() + '/' + menuItem.menu()[moduleKey + 1].route);
                            };
                        } else if (this.sideNavTypes()[key + 1] != undefined) {
                            this.next = function () {
                                router.navigate(project.editUrl() + '/' + this.sideNavTypes()[key + 1].menu()[0].route);
                            };
                        } else {
                            this.next = undefined
                        }
                    }
                }.bind(this));
            }, this);

        },
        initFromConfig: function(name, dataMap) {
            var basePath = process.cwd();
            var config = JSON.parse(fs.readFileSync([basePath, 'app', 'addons', name, 'config.json'].join(env.pathSeparator()), 'utf8'));
            this.initFromArray(config, dataMap);
        },
        save: function() {
            var deferred = q.defer();
            vstack.db.transaction(function (tx) {
                var sql = "UPDATE addon SET name=?, enabled=?, title=?, type=?, version=?, priority=? WHERE name=?";
                tx.executeSql(sql, [
                    this.name,
                    this.enabled() ? 1 : 0,
                    this.title,
                    this.type,
                    this.version,
                    this.priority(),
                    this.name
                ], function (tx, results) {
                    deferred.resolve(true);
                }, function(tx, error) {
                    console.error(error);
                    deferred.resolve(false);
                });
            }.bind(this));
            return deferred.promise;
        },
        enableLiveUpdates: function() {
            /**
             * Save back to main project on change.
             */
            ko.computed(function () {
                ko.toJS(this.data()); //Needed to trigger change as mapping does not trigger on sub changes but is need for conversion.
                this.project.peek().settings.peek()[this.name] = mapping.toJS(this.data(), {}); // Block change on project.
                console.log(this.project.peek().settings.peek());
            }, this);
        }
    });

    var find = function(condition) {
        var deferred = q.defer();
        var sql = 'SELECT a.rowid as id,a.*,t.priority AS t_priority FROM addon a LEFT JOIN type t ON a.type = t.name';
        condition = condition || [];
        if (condition.length > 0) {
            sql += ' WHERE ';
        }
        condition.forEach(function() {
            sql += condition;
        });
        sql += ' ORDER BY t.priority, a.priority';
        vstack.db.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, results) {
                var len = results.rows.length, i, data = [];
                for (i = 0; i < len; i++) {
                    var row = results.rows.item(i);
                    var addon = new Addon(row);
                    data.push(addon);
                }
                deferred.resolve(data);
            });
        });
        return deferred.promise;
    };

    Addon.findAllTypes = function() {
        var deferred = q.defer();
        var sql = 'SELECT a.type, t.priority FROM addon a LEFT JOIN type t ON a.type = t.name GROUP BY a.type ORDER BY t.priority, a.priority';
        vstack.db.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, results) {
                deferred.resolve(results);
            });
        });
        return deferred.promise;
    };

    Addon.findByType = function(type) {
        var deferred = q.defer();
        find(['type="'+type+'"']).then(function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    Addon.findOne = function() {
        var deferred = q.defer();
        find().then(function(data) {
            if (data) {
                deferred.resolve(data[0]);
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };

    Addon.findAll = function() {
        var deferred = q.defer();
        find().then(function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    Addon.findEnabled = function() {
        var deferred = q.defer();
        find(['enabled="1"']).then(function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    };

    return Addon;
});