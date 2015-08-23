define([
    'plugins/router',
    'knockout',
    'jquery',
    'ko-postbox',
    'lib/models/Addon',
    'bindings/select2'
],
function(router, ko, $, postbox, Addon) {

    var Packages = Addon.extend({
        init: function () {
            this._super('packages');
            this.enableLiveUpdates();
        },
        packages_config: {
            placeholder: 'Enter system packages',
            tags: ['vim', 'htop'],
            tokenSeparators: [',', ' ']
        }
    });

    return Packages;
});