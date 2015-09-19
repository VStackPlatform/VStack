define([
    'plugins/router',
    'knockout',
    'jquery',
    'ko-postbox',
    'app-lib/models/Addon'
],
function(router, ko, $, postbox, Addon) {

    var AWS = Addon.extend({
        init: function () {
            this._super('aws');

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

    return AWS;
});
