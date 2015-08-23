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

        var Ruby = Addon.extend({
            init: function () {
                this._super('ruby');
                this.enableLiveUpdates();

                /**
                 * Adds another version
                 */
                this.addVersion = function() {
                    this.data().options.versions.push({
                        version: '',
                        gems: ko.observableArray([])
                    });
                }.bind(this);

                /**
                 * Removes the ruby version.
                 * @param model
                 * @param event
                 */
                this.removeVersion = function(model, event) {
                    this.data().options.versions.remove(model);
                }.bind(this);

                /**
                 * Versions that are can be installed.
                 */
                this.availableVersions = ko.observableArray([
                    "1.8.6-p420",
                    "1.8.7-p374",
                    "1.9.1-p431",
                    "1.9.2-p320",
                    "1.9.3",
                    "2.0.0-p481",
                    "2.1.2"
                ]);
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

        return Ruby;

    } catch (e) {
        console.error(e.stack);
        return {};
    }
});