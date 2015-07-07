/**
 *
 */
define([
    'plugins/router',
    'knockout',
    'jquery',
    'lib/webserver/nginx/Server',
    'lib/webserver/nginx/Stream',
    'lib/webserver/nginx/Site',
    'lib/webserver/nginx/directives',
    'ko-postbox',
    'bindings/select2'
], function(router, ko, $, Server, Stream, Site, directives) {
    var obj = {
        project: ko.observable().syncWith('project.main', true),
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
    };

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

    /**
     * Go back to previous node.
     */
    obj.prev = function() {
        router.navigate(obj.project().editUrl() + '/apache');
    };

    /**
     * Go on to next node.
     */
    obj.next = function() {
        router.navigate(obj.project().editUrl() + '/mysql');
    };

    /**
     *
     */
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