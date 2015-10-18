define([
    'app-lib/models/Addon'
],
function(Addon) {

    var Docker = Addon.extend({
        init: function () {
            this._super('docker');
            this.enableLiveUpdates();
        }
    });

    return Docker;
});
