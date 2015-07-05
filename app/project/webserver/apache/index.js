/**
 * Created by damian on 9/05/15.
 */
define([
    'plugins/router',
    'knockout',
    'jquery',
    'lib/VirtualHost',
    'ko-postbox',
    'bindings/select2'
], function(router, ko, $, VirtualHost) {
    var obj = {
        project: ko.observable().syncWith('project.main', true),
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
    };

    obj.updateServerAlias = function(model, event) {
        model.serveraliases(event.target.value.split(','));
    };

    /**
     * Whether to install this node or not.
     */
    obj.apache = ko.computed({
        read: function() {
            return this.project().settings().webServer.apache();
        },
        write: function(val) {
            this.project().settings().webServer.apache(val);
        }
    }, obj);

    /**
     * Options for configuring this node.
     */
    obj.options = ko.computed({
        read: function() {
            return this.project().settings().webServer.apache_options;
        },
        write: function(val) {
            this.project().settings().webServer.apache_options = val;
        }
    }, obj);

    /**
     * Go back to previous node.
     */
    obj.prev = function() {
        router.navigate(obj.project().editUrl() + '/users');
    };

    /**
     * Go on to next node.
     */
    obj.next = function() {
        router.navigate(obj.project().editUrl() + '/nginx');
    };

    /**
     * Add a new virtual host.
     */
    obj.addVirtualHost = function() {
        obj.options().vhosts.push(new VirtualHost());
    };

    /**
     * Remove a virtual host.
     *
     * @param model The virtual host to remove.
     */
    obj.removeVirtualHost = function(model) {
        obj.options().vhosts.remove(model);
    };

    return obj;
});