define([
    'plugins/router',
    'knockout',
    'jquery',
    'ko-postbox',
    'lib/models/Addon',
    'bindings/select2'
],
function(router, ko, $, postbox, Addon) {

    try {
        var NodeJS = Addon.extend({
            init: function () {
                this._super('nodejs');
                this.enableLiveUpdates();
            },
            npmConfig: {
                placeholder: 'NPM Packages',
                tags: [''],
                tokenSeparators: [',', ' ']
            }
        });
        return new NodeJS();

    } catch (e) {
        console.error(e.stack);
    }
});