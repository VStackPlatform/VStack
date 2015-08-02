define(['plugins/router', 'knockout', 'jquery', 'ko-postbox', 'lib/models/Addon', 'bindings/select2'], function(router, ko, $, postbox, Addon) {
    try {

        var Ruby = Addon.extend({
            init: function () {
                this._super('ruby');
            },
            gemsConfig: {
                placeholder: 'Gems to install',
                tags: ['sass', 'less', 'haml', 'bundler'],
                tokenSeparators: [',', ' ']
            },
            versionConfig: {
                placeholder: 'Select your version'
            }
        });

        var obj = new Ruby();

        /**
         * Various php options.
         */
        obj.options = ko.computed({
            read: function () {
                return this.project().settings().language.ruby_options;
            },
            write: function (val) {
                this.project().settings().language.ruby_options = val;
            }
        }, obj);

        /**
         * Adds another version
         */
        obj.addVersion = function() {
            obj.options().versions.push({
                version: '',
                gems: ko.observableArray([])
            });
        };

        /**
         * Removes the ruby version.
         * @param model
         * @param event
         */
        obj.removeVersion = function(model, event) {
            obj.options().versions.remove(model);
        };

        /**
         * Versions that are can be installed.
         */
        obj.availableVersions = ko.observableArray([
            "1.8.6-p420",
            "1.8.7-p374",
            "1.9.1-p431",
            "1.9.2-p320",
            "1.9.3",
            "2.0.0-p481",
            "2.1.2"
        ]);

    } catch (e) {
        console.error(e.stack);
    }
    return obj;
});