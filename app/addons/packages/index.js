define(['plugins/router', 'knockout', 'jquery', 'ko-postbox', 'lib/models/Addon', 'bindings/select2'], function(router, ko, $, postbox, Addon) {

    var Packages = Addon.extend({
        init: function () {
            this._super('packages');
        },
        packages_config: {
            placeholder: 'Enter system packages',
            tags: ['vim', 'htop'],
            tokenSeparators: [',', ' ']
        }
    });

    var obj = new Packages();

    obj.packages = ko.computed({
        read: function() {
            return this.project().settings().system.packages();
        },
        write: function(val) {
            this.project().settings().system.packages(val);
        }
    }, obj);

    return obj;
});