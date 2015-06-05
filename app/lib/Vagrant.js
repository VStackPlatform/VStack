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

    Vagrant.prototype.executeCommand = function(fullPath, command, args) {
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
        });
    };

    Vagrant.prototype.up = function(fullPath) {
        this.executeCommand(fullPath, 'up');
    };

    Vagrant.prototype.provision = function(fullPath) {
        this.executeCommand(fullPath, 'provision');
    };

    Vagrant.prototype.halt = function(fullPath) {
        this.executeCommand(fullPath, 'halt');
    };

    Vagrant.prototype.reload = function(fullPath) {
        this.executeCommand(fullPath, 'reload');
    };

    Vagrant.prototype.destroy = function(fullPath) {
        this.executeCommand(fullPath, 'destroy', ['-f']);
    };

    Vagrant.prototype.getStatus = function(fullPath) {
        var self = this;
        this.commandRunning(true);
        var deferred = q.defer();
        var path = fs.lstatSync(fullPath);
        if (path.isDirectory()) {
            postbox.publish('Term.main', colors.green(env.exeFile('vagrant') + ' status' + '\r\n'));
            exec('cd ' + fullPath + ' && ' + env.exeFile('vagrant') + ' status', function (error, stdout, stderr) {

                if (error) {
                    postbox.publish('Term.main', colors.red(stderr + '\r\n'));
                    deferred.reject(error);
                } else {
                    stdout.split('\n').forEach(function(value, key) {
                        postbox.publish('Term.main', colors.green(value + '\r\n'));
                    });
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