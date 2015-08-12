define([
    'plugins/router',
    'knockout',
    'jquery',
    'ko-postbox',
    'lib/models/Addon'
],
function(router, ko, $, postbox, Addon) {

    var DigitalOcean = Addon.extend({
        init: function () {
            this._super('do');

            this.enableLiveUpdates();

            this.addSyncedFolder = function() {
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
