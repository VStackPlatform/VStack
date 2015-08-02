define(['plugins/router', 'knockout', 'jquery', 'ko-postbox', 'lib/models/Addon', 'bindings/select2'], function(router, ko, $, postbox, Addon) {

    var PHP = Addon.extend({
        init: function () {
            this._super('php');
        },
        ini_config: {
            placeholder: 'Ini Settings',
            tags: [''],
            tokenSeparators: [',']
        },
        modules_config: {
            placeholder: 'PHP Modules',
            tags: [''],
            tokenSeparators: [',', ' ']
        },
        pear_config: {
            placeholder: 'PEAR Modules',
            tags: [''],
            tokenSeparators: [',', ' ']
        },
        pecl_config: {
            placeholder: 'PECL Modules',
            tags: [''],
            tokenSeparators: [',', ' ']
        },
        xdebug_config: {
            placeholder: 'XDebug Settings',
            tags: [''],
            tokenSeparators: [',', ' ']
        }
    });

    var obj = new PHP();

    try {

        /**
         * Whether to install php or not.
         */
        obj.php = ko.computed({
            read: function () {
                return this.project().settings().language.php();
            },
            write: function (val) {
                this.project().settings().language.php(val);
            }
        }, obj);

        /**
         * Various php options.
         */
        obj.options = ko.computed({
            read: function () {
                return this.project().settings().language.php_options;
            },
            write: function (val) {
                this.project().settings().language.php_options = val;
            }
        }, obj);


        /**
         * For general settings to save as an array.
         */
        var settings = [];
        ko.utils.objectForEach(obj.options().ini_settings(), function (key, value) {
            settings.push(key + "=" + value);
        });
        obj.tempSettings = ko.observableArray(settings);
        obj.settingToArray = ko.computed(function () {
            var settings = {};
            ko.utils.arrayForEach(obj.tempSettings(), function (value) {
                var temp = value.split('=');
                settings[temp[0]] = temp[1];
            });
            obj.options.peek().ini_settings(settings);
        }, obj);


        /**
         * For XDebug settings to save as an array.
         */
        var xDebugSettings = [];
        ko.utils.objectForEach(obj.options().xdebug_options.settings(), function (key, value) {
            xDebugSettings.push(key + "=" + value);
        });
        obj.xDebugSettings = ko.observableArray(xDebugSettings);
        obj.xDebugSettingsToArray = ko.computed(function () {
            var settings = {};
            ko.utils.arrayForEach(obj.xDebugSettings(), function (value) {
                var temp = value.split('=');
                settings[temp[0]] = temp[1];
            });
            obj.options.peek().xdebug_options.settings(settings);
        }, obj);

    } catch (e) {
        console.error(e.stack);
    }
    return obj;
});