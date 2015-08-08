define([
    'knockout',
    'lib/models/Addon'
],
function(ko, Addon) {

    var Firewall = Addon.extend({
        init: function () {
            this._super('firewall');
            this.enableLiveUpdates();
        }
    });
    return new Firewall();
});