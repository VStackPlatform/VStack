define(['plugins/router', 'knockout', 'jquery','ko-postbox', 'lib/models/Addon', 'bindings/select2'], function(router, ko, $, postbox, Addon) {

    var NodeJS = Addon.extend({
        init: function () {
            this._super('nodejs');
        },
        npmConfig: {
            placeholder: 'NPM Packages',
            tags: [''],
            tokenSeparators: [',', ' ']
        }
    });

    try {
        var obj = new NodeJS();

        /**
         * Whether to install nodejs or not.
         */
        obj.nodejs = ko.computed({
            read: function () {
                return this.project().settings().language.nodejs();
            },
            write: function (val) {
                this.project().settings().language.nodejs(val);
            }
        }, obj);

        /**
         * Various nodejs options.
         */
        obj.options = ko.computed({
            read: function () {
                return this.project().settings().language.nodejs_options;
            },
            write: function (val) {
                this.project().settings().language.nodejs_options = val;
            }
        }, obj);

        return obj;

    } catch (e) {
        console.error(e.stack);
    }
});