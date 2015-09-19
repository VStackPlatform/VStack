define(['app-lib/models/Query', 'app-lib/environment'], function(Query, env) {
    var fs = require('fs');
    var basePath = process.cwd();
    var q = require('q');

    var Vstack = Query.extend({
        init: function(db_name) {
            db_name = db_name || 'vstack';
            this._super(db_name);
        },
        createTables: function() {
            console.log('creating tables....');
            return q.all([
                this.createProject(),
                this.createAddon()
            ]);
        },
        createProject: function() {
            var deferred = q.defer();
            this.db.transaction(function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS project (name, path, settings, version)", [], function() {
                    deferred.resolve(true);
                }, function() {
                    deferred.resolve(true);
                });
            });
            return deferred.promise;
        },
        createAddon: function() {
            var deferred = q.defer();
            this.db.transaction(function (tx) {
                tx.executeSql("CREATE TABLE IF NOT EXISTS project_addon (projectID, addonID)");
            });
            this.db.transaction(function (tx) {
                tx.executeSql("CREATE TABLE type (name, priority INT)", [], function (tx, results) {

                    var $sql = "INSERT INTO type (name, priority) VALUES (?, ?)";
                    tx.executeSql($sql, ['Target', 1]);
                    tx.executeSql($sql, ['System', 2]);
                    tx.executeSql($sql, ['Language', 3]);
                    tx.executeSql($sql, ['Database', 4]);
                    tx.executeSql($sql, ['Web Server', 5]);

                }, function (err, err2) {
                    // Do nothing as table already exists.
                });
            });
            this.db.transaction(function (tx) {
                tx.executeSql("CREATE TABLE addon (name, enabled INT, title, type, version, priority INT, modules, data)", [], function (tx, results) {
                    var $sql = "INSERT INTO addon (name, enabled, title, type, version, priority, modules, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    var srcPath = env.buildPath([basePath, 'app', 'addons']);
                    fs.readdir(srcPath, function (stderr, files) {
                        if (stderr) {
                            console.error(stderr.stack);
                        }
                        var count = 0;
                        if (files) {
                            files.forEach(function (file) {
                                var filePath = env.buildPath([srcPath, file]);
                                fs.stat(filePath, function (stderr, stat) {
                                    if (stat.isDirectory()) {
                                        var config = env.buildPath([filePath, 'config.json']);
                                        fs.stat(config, function (stderr, stat) {
                                            if (stat.isFile()) {
                                                fs.readFile(config, 'utf8', function (error, data) {
                                                    var json = JSON.parse(data);
                                                    this.db.transaction(function (tx) {
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
                                                        count++;
                                                        if (files.length == count) {
                                                            deferred.resolve(true);
                                                        }
                                                    });
                                                }.bind(this));
                                            }
                                        }.bind(this));
                                    } else {
                                        count++;
                                        if (files.length == count) {
                                            deferred.resolve(true);
                                        }
                                    }
                                }.bind(this));
                            }.bind(this));
                        }
                    }.bind(this));
                }.bind(this), function () {
                    deferred.resolve(true);
                    // Do nothing as table already exists.
                });
            }.bind(this));
            return deferred.promise;
        },
        dropTables: function() {
            var deferred = q.defer();
            this.db.transaction(function (tx) {
                console.log('dropping tables....');
                tx.executeSql("DROP TABLE addon");
                tx.executeSql("DROP TABLE project_addon");
                tx.executeSql("DROP TABLE project");
                tx.executeSql("DROP TABLE type");
                deferred.resolve(true);
            });
            return deferred.promise;
        }
    });
    return Vstack;
});