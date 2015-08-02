define(['plugins/router', 'knockout', 'jquery', 'lib/projectTemplate', 'ko-postbox', 'lib/models/Addon'], function(router, ko, $, template, postbox, Addon) {

    var DigitalOcean = Addon.extend({
        init: function () {
            this._super('do');
        }
    });

    var obj =  new DigitalOcean();

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
