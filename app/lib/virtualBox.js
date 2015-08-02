define(['lib/environment'], function(env) {
    var exec = require('child_process').exec;
    var q = require('q');
    var fs = require('fs');

    var vb = {
        vmNames: function() {
            var deferred = q.defer();
            exec(env.exeFile('VBoxManage') + ' list vms', function (error, stdout, stderr) {

                if (error) {
                    deferred.reject(stderr);
                }

                var rows = stdout.split('\n');
                var names = [];
                rows.forEach(function(value, index) {
                    names.push(rows[index].replace(/"/g, '').replace(/{.*}/, '').trim());
                });
                deferred.resolve(names);
            });
            return deferred.promise;
        }
    };

    return vb;
});