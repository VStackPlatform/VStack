define([
    'plugins/router',
    'knockout',
    'jquery',
    'ko-postbox',
    'app-lib/models/Addon',
    'bindings/select2',
    'components/c-nav/c-nav'
],
function(router, ko, $, postbox, Addon) {

    var Users = Addon.extend({
        init: function () {
            this._super('users');
            this.enableLiveUpdates();
        },
        users_config: {
            placeholder: 'Enter Users',
            tags: [],
            tokenSeparators: [',', ' ']
        },
        groups_config: {
            placeholder: 'Enter Groups',
            tags: [],
            tokenSeparators: [',', ' ']
        }
    });

    return Users;
});