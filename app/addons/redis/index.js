define([
    'plugins/router',
    'knockout',
    'ko-validation',
    'ko-postbox',
    'lib/models/Addon',
    'bindings/select2'
],
function(router, ko, validation, postbox, Addon) {

    var Redis = Addon.extend({
        init: function () {
            this._super('redis');
            this.enableLiveUpdates();
        }
    });

    return new Redis();
});