/**
 * Created by damian on 8/05/15.
 */
define(['plugins/router', 'knockout', 'jquery', 'lib/ProjectTemplate', 'ko-postbox'], function(router, ko, $, template) {
    var obj = {
        project: ko.observable().syncWith('project.main', true)
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
            return this.project().settings().target.do_options;
        },
        write: function(val) {
            this.project().settings().target.do_options = val;
        }
    }, obj);
    obj.prev = function() {
        router.navigate(obj.project().editUrl() + '/nodejs');
    };
    obj.next = function() {
        router.navigate(obj.project().editUrl() + '/packages');
    };
    obj.addSyncedFolder = function() {
        var synced_folder = template.target.do_options.synced_folders;
        Object.keys(synced_folder).forEach(function(key) {
            synced_folder[key] = '';
        });
        obj.options().synced_folders.push({from: '', to: '', type: "nfs", owner: 'www-data', group: 'www-data'});
    };
    obj.removeSyncedFolder = function(model) {
        obj.options().synced_folders.remove(model);
    };
    return obj;
});
