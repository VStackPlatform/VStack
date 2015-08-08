define([
    'plugins/router',
    'knockout',
    'jquery',
    'lib/projectTemplate',
    'ko-postbox',
    'lib/models/Addon'
],
function(router, ko, $, template, postbox, Addon) {

    var DigitalOcean = Addon.extend({
        init: function () {
            this._super('do');

            this.enableLiveUpdates();

            this.target = ko.computed({
                read: function() {
                    return this.project().settings().target.type();
                },
                write: function(val) {
                    this.project().settings().target.type(val);
                }
            }, this);

            this.addSyncedFolder = function() {
                var synced_folder = template.target.do_options.synced_folders;
                Object.keys(synced_folder).forEach(function(key) {
                    synced_folder[key] = '';
                });
                console.log(this.data().options);
                this.data().options.synced_folders.push({
                    from: '',
                    to: '',
                    type: "nfs",
                    owner: 'www-data',
                    group: 'www-data'
                });
            }.bind(this);
            this.removeSyncedFolder = function(model) {
                this.data().options.synced_folders.remove(model);
            }.bind(this);
        }
    });

    return new DigitalOcean();
});
