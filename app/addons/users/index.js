define(['plugins/router', 'knockout', 'jquery', 'ko-postbox', 'lib/models/Addon', 'bindings/select2'], function(router, ko, $, postbox, Addon) {

    var Users = Addon.extend({
        init: function () {
            this._super('users');
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

    var obj = new Users();

    obj.users = ko.computed({
        read: function() {
            return this.project().settings().system.users();
        },
        write: function(val) {
            this.project().settings().system.users(val);
        }
    }, obj);
    obj.groups = ko.computed({
        read: function() {
            return this.project().settings().system.groups();
        },
        write: function(val) {
            this.project().settings().system.groups(val);
        }
    }, obj);

    return obj;
});