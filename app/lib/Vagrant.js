/**
 * Created by damian on 15/05/15.
 */
define(['knockout', 'lib/Environment', 'ko-postbox'], function(ko, env, postbox) {
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

    Vagrant.prototype.up = function(fullPath, callback) {
        this.executeCommand(fullPath, 'up', [], callback);
    };

    Vagrant.prototype.provision = function(fullPath, callback) {
        this.executeCommand(fullPath, 'provision', [], callback);
    };

    Vagrant.prototype.halt = function(fullPath, callback) {
        this.executeCommand(fullPath, 'halt', [], callback);
    };

    Vagrant.prototype.reload = function(fullPath, callback) {
        this.executeCommand(fullPath, 'reload', [], callback);
    };

    Vagrant.prototype.destroy = function(fullPath, callback) {
        this.executeCommand(fullPath, 'destroy', ['-f'], callback);
    };

    Vagrant.prototype.getStatus = function(fullPath) {
        var self = this;
        this.commandRunning(true);
        var deferred = q.defer();
        var path = fs.lstatSync(fullPath);
        if (path.isDirectory()) {
            exec('cd ' + fullPath + ' && ' + env.exeFile('vagrant') + ' status', function (error, stdout, stderr) {

                if (error) {
                    console.error(stderr);
                    self.commandRunning(false);
                    deferred.reject(error);
                } else {
                    var rows = stdout.split('\n');
                    for (var j = 0; j < rows.length; j++) {
                        var result = rows[j].split(/[ ]+/).filter(function (n) {
                            return n != '';
                        });
                        if (result[0] == 'default') {
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