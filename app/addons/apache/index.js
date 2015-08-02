define([
    'plugins/router',
    'knockout',
    'jquery',
    'addons/apache/lib/models/VirtualHost',
    'ko-postbox',
    'lib/models/Addon',
    'ko-mapping',
    'bindings/select2'
], function (router, ko, $, VirtualHost, postbox, Addon, mapping) {
    try {
        var Apache = Addon.extend({
            init: function() {
                this._super('apache', {
                    "vhosts": {
                        create: function (options) {
                            return new VirtualHost(options.data);
                        }
                    }
                });

                /**
                 * Whether to install this node or not.
                 */
                if (this.settings().install !== undefined) {
                    this.install = ko.computed({
                        read: function () {
                            return this.settings().install();
                        }.bind(this),
                        write: function (val) {
                            this.settings().install(val);
                        }.bind(this)
                    });
                }

                /**
                 * Options for configuring this node.
                 */
                this.options = ko.computed({
                    read: function() {
                        return this.settings().options;
                    }.bind(this),
                    write: function(val) {
                        this.settings().options = val;
                    }.bind(this)
                });

                /**
                 * Save back to main project on change.
                 */
                ko.computed(function() {
                    this.project().settings.peek()[this.name] = mapping.toJS(this.settings());
                }, this);

                /**
                 * Remove a virtual host.
                 *
                 * @param model The virtual host to remove.
                 */
                this.removeVirtualHost = function(model) {
                    this.options().vhosts.remove(model);
                }.bind(this);

                /**
                 * Update server alias
                 */
                this.updateServerAlias = function(model, event) {
                    model.serveraliases(event.target.value.split(','));
                };

                /**
                 * Add a new virtual host.
                 */
                this.addVirtualHost = function() {
                    this.vhosts.push(new VirtualHost());
                };

            },
            module_config: {
                placeholder: 'Enter Apache Modules',
                tags: ['rewrite', 'proxy_fcgi'],
                tokenSeparators: [',', ' ']
            },
            env_config: {
                placeholder: 'Enter Environment Variables',
                tags: ['APP_ENV dev'],
                tokenSeparators: [',']
            },
            options_config: {
                placeholder: 'Enter Directory Options',
                tags: ['Indexes', 'FollowSymLinks', 'MultiViews'],
                tokenSeparators: [',', ' ']
            },
            override_config: {
                placeholder: 'Enter Overrides',
                tags: ['All', 'None', 'AuthConfig', 'FileInfo', 'Indexes', 'Limit'],
                tokenSeparators: [',', ' ']
            },
            serveraliases_config: {
                placeholder: 'Enter Aliases',
                tags: [],
                tokenSeparators: [',', ' ']
            }
        });

        return new Apache();

    } catch (e) {
        console.error(e.stack);
    }
});