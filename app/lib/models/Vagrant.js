define(['knockout', 'app-lib/environment', 'ko-postbox'], function(ko, env, postbox) {
    var colors = require('colors');
    var spawn = require('child_process').spawn;
    var exec = require('child_process').exec;
    var q = require('q');
    var fs = require('fs');

    var Vagrant = function() {
        this.commandRunning = ko.observable(false).syncWith('vagrant.commandRunning');
    };

    Vagrant.prototype.executeCommand = function(fullPath, command, args, callback) {
        var self = this;
        this.commandRunning(true);

        if (args == undefined) {
            args = [];
        }
        args = [command].concat(args);

        postbox.publish('Term.main', colors.bold('cd ' + fullPath + ' && ' + env.exeFile('vagrant') + ' ' + args.join(' ') + '\r\n'));

        var process = spawn(env.exeFile('vagrant'), args, {
            cwd: fullPath
        });

        process.stdout.on('data', function(data) {
            ('' + data).split('\n').forEach(function(value, key) {
                postbox.publish('Term.main', colors.green(value + '\r\n'));
            });
        });
        process.stderr.on('data', function(data) {
            ('' + data).split('\n').forEach(function(value, key) {
                postbox.publish('Term.main', colors.red(value + '\r\n'));
            });
        });

        process.on('close', function (code) {
            postbox.publish('Term.main', colors.rainbow('command completed.\r\n'));
            self.commandRunning(false);
            if (typeof callback == 'function') {
                callback();
            }
        });
    };

    Vagrant.prototype.installPlugin = function(plugin, fullPath, callback) {
        this.executeCommand(fullPath, 'plugin', ['install', plugin], callback);
    };

    Vagrant.prototype.addBox = function(name, box, fullPath, callback) {
        this.executeCommand(fullPath, 'box', ['add', name, box, '-f'], callback);
    };

    Vagrant.prototype.up = function(fullPath, machine, callback, args) {
        args = args ? args.unshift(machine) : [machine];
        this.executeCommand(fullPath, 'up', args, callback);
    };

    Vagrant.prototype.provision = function(fullPath, machine, callback) {
        this.executeCommand(fullPath, 'provision', [machine], callback);
    };

    Vagrant.prototype.halt = function(fullPath, machine, callback) {
        this.executeCommand(fullPath, 'halt', [machine], callback);
    };

    Vagrant.prototype.reload = function(fullPath, machine, callback) {
        this.executeCommand(fullPath, 'reload', [machine], callback);
    };

    Vagrant.prototype.destroy = function(fullPath, machine, callback) {
        this.executeCommand(fullPath, 'destroy', [machine, '-f'], callback);
    };

    Vagrant.prototype.getStatus = function(fullPath, machine) {

        var deferred = q.defer();
        machine = machine || '';
        var path = fs.lstatSync(fullPath);
        var self = this;
        this.commandRunning(true);
        if (path.isDirectory()) {
            exec('cd ' + fullPath + ' && ' + env.exeFile('vagrant') + ' ' + 'status ' + machine, function (error, stdout, stderr) {

                if (error) {
                    console.error(stderr);
                    self.commandRunning(false);
                    deferred.reject('error');
                } else {
                    var rows = stdout.split('\n');
                    for (var j = 0; j < rows.length; j++) {
                        var result = rows[j].split(/[ ]+/).filter(function (n) {
                            return n != '';
                        });
                        if (result[0] == machine) {
                            self.commandRunning(false);
                            result.shift(); //remove from end
                            result.pop(); //remove from start
                            deferred.resolve(result.join(' ').trim());
                        }
                    }
                    deferred.resolve('not setup');
                }
            });
        } else {
            deferred.resolve('not folder');
        }
        return deferred.promise;

    };
    return Vagrant;
});