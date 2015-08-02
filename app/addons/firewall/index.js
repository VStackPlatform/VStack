define(['knockout', 'lib/models/Addon'], function(ko, Addon) {

    var Firewall = Addon.extend({
        init: function () {
            this._super('firewall');
        }
    });
    return new Firewall();
});