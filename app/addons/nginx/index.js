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
    'bindings/select2'
], function(router, ko, $, Server, Stream, Site, directives, postbox, Addon) {

    var Nginx = Addon.extend({
        init: function () {
            this._super('nginx');
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

    var obj =  new Nginx();

    /**
     * Whether to install this node or not.
     */
    obj.nginx = ko.computed({
        read: function() {
            return this.project().settings().webServer.nginx();
        },
        write: function(val) {
            this.project().settings().webServer.nginx(val);
        }
    }, obj);

    /**
     * Options for configuring this node.
     */
    obj.options = ko.computed({
        read: function() {
            return this.project().settings().webServer.nginx_options;
        },
        write: function(val) {
            this.project().settings().webServer.nginx_options = val;
        }
    }, obj);

    obj.addSite = function() {
        obj.options().sites.push(new Site({
            site_name: '',
            upstreams: [],
            servers: []
        }));
    };

    obj.removeSite = function(model) {
        console.log('removing: ', model);
        obj.options().sites.remove(model);
    };

    return obj;
});