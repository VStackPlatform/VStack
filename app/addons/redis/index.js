define([
    'plugins/router',
    'knockout',
    'ko-validation',
    'ko-postbox',
    'app-lib/models/Addon',
    'bindings/select2',
    'components/c-nav/c-nav'
],
function(router, ko, validation, postbox, Addon) {

    var Redis = Addon.extend({
        init: function () {
            this._super('redis');
            this.enableLiveUpdates();
        }
    });

    return Redis;
});