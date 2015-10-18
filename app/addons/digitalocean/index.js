define([
    'plugins/router',
    'knockout',
    'jquery',
    'ko-postbox',
    'app-lib/models/Addon',
    'components/c-nav/c-nav'
],
function(router, ko, $, postbox, Addon) {

    var DigitalOcean = Addon.extend({
        init: function () {
            this._super('digitalocean');

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

    return DigitalOcean;
});
