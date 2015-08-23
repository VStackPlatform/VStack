define([
    'plugins/router',
    'knockout',
    'jquery',
    'addons/nginx/lib/models/Server',
    'addons/nginx/lib/models/Stream',
    'addons/nginx/lib/models/Site',
    'addons/nginx/lib/directives',
    'ko-postbox',
    'lib/models/Addon',
    'ko-mapping',
    'bindings/select2'
], function(router, ko, $, Server, Stream, Site, directives, postbox, Addon, mapping) {

    var Nginx = Addon.extend({
        init: function () {
            this._super('nginx', {
                "options": {
                    create: function (options) {
                        return new function () {
                            mapping.fromJS(options.data, {
                                "sites": {
                                    "create": function (model) {
                                        if (model.data.site_name == undefined) {
                                            model.data.site_name = '';
                                        }
                                        return new Site(model.data);
                                    }
                                }
                            }, this);
                        };
                    }
                }
            });
            this.enableLiveUpdates();

            this.addSite = function() {
                this.data().options.sites.push(new Site({
                    site_name: '',
                    upstreams: [],
                    servers: []
                }));
            }.bind(this);

            this.removeSite = function(model) {
                this.data().options.sites.remove(model);
            }.bind(this);
        },
        serveraliases_config: {
            placeholder: 'Enter Aliases',
            tags: [],
            tokenSeparators: [',', ' ']
        },
        directive_config: {
            placeholder: 'Enter Directive Name',
            tags: [
                'server',
                'zone',
                'hash',
                'keepalive',
                'allow',
                'deny',
                'health_check',
                'least_conn'
            ],
            maximumSelectionSize: 1
        },
        server_directive_config: {
            placeholder: 'Enter Directive Name',
            tags: directives,
            maximumSelectionSize: 1
        }
    });

    return Nginx;
});