define(['lib/models/Query', 'lib/environment'], function(Query, env) {
    var fs = require('fs');
    var basePath = process.cwd();

    var VStack = Query.extend({
        init: function() {
            this._super('vstack');
        },
        createTables: function() {
            this.db.transaction(function (tx) {

                tx.executeSql("CREATE TABLE IF NOT EXISTS project (name, path, settings, version)");
                tx.executeSql("CREATE TABLE addon (name, enabled INT, title, type, version, priority INT, modules, data)", [], function(tx, results) {
                    var $sql = "INSERT INTO addon (name, enabled, title, type, version, priority, modules, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

                    var srcPath = env.buildPath([basePath, 'app', 'addons']);
                    fs.readdir(srcPath, function(stderr, files) {
                        files.forEach(function(file) {
                            var filePath = env.buildPath([srcPath, file]);
                            fs.stat(filePath, function(stderr, stat) {
                                if (stat.isDirectory()) {
                                    var config = env.buildPath([filePath, 'config.json']);
                                    fs.stat(config, function(stderr, stat) {
                                        if (stat.isFile()) {
                                            fs.readFile(config, 'utf8', function(error, data) {
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
                                                });
                                            }.bind(this));
                                        }
                                    }.bind(this));
                                }
                            }.bind(this));
                        }.bind(this));
                    }.bind(this));
                }.bind(this), function() {
                    // Do nothing as table already exists.
                });
                tx.executeSql("CREATE TABLE IF NOT EXISTS project_addon (projectID, addonID)");
                tx.executeSql("CREATE TABLE type (name, priority)", [], function(tx, results) {
                    var $sql = "INSERT INTO types (name, priority) VALUES (?, ?)";
                    tx.executeSql($sql, ['Target', '1']);
                    tx.executeSql($sql, ['System', '2']);
                    tx.executeSql($sql, ['Language', '3']);
                    tx.executeSql($sql, ['Database', '4']);
                    tx.executeSql($sql, ['Web Server', '5']);
                }, function() {
                    // Do nothing as table already exists.
                });
            }.bind(this));
        }
    });
    return new VStack();
});