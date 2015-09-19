define([
    'knockout',
    'app-lib/models/Addon',
    'app-lib/models/Type',
    'app-lib/environment',
    'app-lib/vstack',
    'ko-dragdrop'
],
function(ko, Addon, Type, env, vstack) {

    var fs = require('fs');
    var q = require('q');
    var basePath = process.cwd();
    var obj = {};
    var refreshList = function() {
        Addon.findAllTypes().then(function(results) {
            var len = results.rows.length, i, types = [];
            for (i = 0; i < len; i++) {
                var row = results.rows.item(i);
                types.push(new Type({
                    name: row.type,
                    priority: row.priority
                }));
            }
            obj.types(types);
        });
    };

    obj.types = ko.observableArray();
    refreshList();

    obj.refreshAddons = function() {
        this.loadAddonConfigs().then(function() {
            refreshList();
        });
    };

    obj.loadAddonConfigs = function() {
        var deferred = q.defer();
        var srcPath = env.buildPath([basePath, 'app', 'addons']);
        fs.readdir(srcPath, function (stderr, files) {
            if (stderr) {
               console.error(stderr);
            } else {
                var finished = 0;
                files.forEach(function (file) {
                    var filePath = env.buildPath([srcPath, file]);
                    fs.stat(filePath, function (stderr, stat) {
                        if (stat.isDirectory()) {
                            var config = env.buildPath([filePath, 'config.json']);
                            fs.stat(config, function (stderr, stat) {
                                if (stat.isFile()) {
                                    fs.readFile(config, 'utf8', function (error, data) {
                                        var json = JSON.parse(data);
                                        vstack.db.transaction(function (tx) {
                                            tx.executeSql("SELECT * FROM addon WHERE name=?", [file], function (tx, results) {
                                                if (results.rows.length > 0) {
                                                    var $sql = "UPDATE addon SET (name=?, title=?, type=?, version=?, modules=?, data=?) WHERE name=?";
                                                    tx.executeSql($sql, [
                                                        json.name,
                                                        json.title || 'Not Set',
                                                        json.type || 'Target',
                                                        json.version || '1.0.0',
                                                        JSON.stringify(json.modules || []),
                                                        JSON.stringify(json.data || {}),
                                                        file
                                                    ]);
                                                } else {
                                                    var $sql = "INSERT INTO addon (name, enabled, title, type, version, priority, modules, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                                                    tx.executeSql($sql, [
                                                        json.name,
                                                        '1',
                                                        json.title || 'Not Set',
                                                        json.type || 'Target',
                                                        json.version || '1.0.0',
                                                        json.priority || 1000,
                                                        JSON.stringify(json.modules || []),
                                                        JSON.stringify(json.data || {})
                                                    ]);
                                                }
                                                finished++;
                                                if (files.length == finished) {
                                                    deferred.resolve(true);
                                                }
                                            });
                                        });
                                    }.bind(this));

                                }
                            }.bind(this));
                        } else {
                            finished++;
                            if (files.length == finished) {
                                deferred.resolve(true);
                            }
                        }
                    });
                });
            }
        });
        return deferred.promise;
    };

    obj.reorder = function (event, dragData, zoneData) {
        if (dragData !== zoneData.item && zoneData.item.identifier == dragData.identifier) {
            var zoneDataIndex = zoneData.items.indexOf(zoneData.item);
            zoneData.items.remove(dragData);
            zoneData.items.splice(zoneDataIndex, 0, dragData);
            zoneData.items().forEach(function(item, index) {
                item.priority(index);
                item.save();
            });
        }
    };
    obj.dragStart = function (item) {
        item.dragging(true);
    };

    obj.dragEnd = function (item) {
        item.dragging(false);
    };
    return obj;
});