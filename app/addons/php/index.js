define([
    'plugins/router',
    'knockout',
    'jquery',
    'ko-postbox',
    'lib/models/Addon',
    'bindings/select2'
], function(router, ko, $, postbox, Addon) {

    try {
        var PHP = Addon.extend({
            init: function () {
                this._super('php', {
                    "ini_settings": {
                        create: function (options) {
                            return ko.observable(options.data);
                        }
                    },
                    "settings": {
                        create: function (options) {
                            return ko.observable(options.data);
                        }
                    }
                });

                this.enableLiveUpdates();

                /**
                 * For general settings to save as an array.
                 */
                var settings = [];
                ko.utils.objectForEach(this.data().options.ini_settings(), function (key, value) {
                    settings.push(key + "=" + value);
                });
                this.tempSettings = ko.observableArray(settings);
                this.settingToArray = ko.computed(function () {
                    var settings = {};
                    ko.utils.arrayForEach(this.tempSettings(), function (value) {
                        var temp = value.split('=');
                        settings[temp[0]] = temp[1];
                    });
                    this.data.peek().options.ini_settings(settings);
                }, this);


                /**
                 * For XDebug settings to save as an array.
                 */
                var xDebugSettings = [];
                ko.utils.objectForEach(this.data().options.xdebug_options.settings(), function (key, value) {
                    xDebugSettings.push(key + "=" + value);
                });
                this.xDebugSettings = ko.observableArray(xDebugSettings);
                this.xDebugSettingsToArray = ko.computed(function () {
                    var settings = {};
                    ko.utils.arrayForEach(this.xDebugSettings(), function (value) {
                        var temp = value.split('=');
                        settings[temp[0]] = temp[1];
                    });
                    this.data.peek().options.xdebug_options.settings(settings);
                }, this);

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

        return new PHP();

    } catch (e) {
        console.error(e.stack);
    }
});