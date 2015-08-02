/**
 * Created by damian on 8/05/15.
 */
define(['plugins/router', 'knockout', 'jquery', 'lib/virtualBox',  'ko-postbox', 'lib/environment'], function(router, ko, $, vb, env) {
    var obj = {
        project: ko.observable().syncWith('project.main', true),
        isWindows: ko.observable(env.isWindows)
    };
    obj.target = ko.computed({
        read: function() {
            return this.project().settings().target.type();
        },
        write: function(val) {
            this.project().settings().target.type(val);
        }
    }, obj);
    obj.options = ko.computed({
        read: function() {
            return this.project().settings().target.local_options;
        },
        write: function(val) {
            this.project().settings().target.local_options = val;
        }
    }, obj);
    obj.prev = function() {
        router.navigate(obj.project().editUrl() + '/nodejs');
    };
    obj.next = function() {
        router.navigate(obj.project().editUrl() + '/packages');
    };
    obj.addForwardPort = function() {
        obj.options().forward_ports.push({host: '', vm: ''});
    };
    obj.removeForwardPort = function(model) {
        obj.options().forward_ports.remove(model);
    };
    obj.addSyncedFolder = function() {
        obj.options().synced_folders.push({from: '', to: '', type: "default", owner: 'www-data', group: 'www-data'});
    };
    obj.removeSyncedFolder = function(model) {
        obj.options().synced_folders.remove(model);
    };
    return obj;
});
