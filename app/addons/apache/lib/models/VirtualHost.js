define(['knockout', 'ko-mapping'], function(ko, mapping) {
    var VirtualHost = function(data) {
        mapping.fromJS({
            name: 'localdev',
            serveraliases: ['www.localdev'],
            docroot: '/var/www',
            port: '80',
            setEnv: '',
            directories: [
                {
                    path: '/var/www',
                    allow_override: [
                        'All'
                    ],
                    options: [
                        'Indexes',
                        'FollowSymLinks',
                        'MultiViews'
                    ]
                }
            ],
            aliases: [],
            ssl: false,
            ssl_cert: '',
            ssl_key: '',
            ssl_chain: '',
            ssl_certs_dir: ''
        }, {}, this);
        mapping.fromJS(data, {}, this);

        /**
         * Removes a alias for a vhost.
         *
         * @param model the alias to remove.
         */
        this.removeAlias = function(model) {
            this.aliases.remove(model);
        }.bind(this);

        /**
         * Removes a directory for a vhost.
         *
         * @param model the directory to remove.
         */
        this.removeDirectory = function(model) {
            this.directories.remove(model);
        }.bind(this);

        /**
         * The conversion back to json.
         */
        this.toJSON = function() {
            var copy = mapping.toJS(this);
            var temp = [];
            copy.aliases.forEach(function(value, key) {
                var newAlias = {};
                newAlias[value.type] = value.url;
                newAlias['path'] = value.path;
                temp.push(newAlias);
            });
            copy.aliases = temp;
            return copy;
        };
    };

    /**
     * Toggles the ssl switch.
     *
     * @param model
     * @returns {*}
     */
    VirtualHost.prototype.toggleSSL = function(model) {
        return model.ssl(!model.ssl());
    };

    /**
     * Adds an alias for a vhost
     */
    VirtualHost.prototype.addAlias = function() {
        this.aliases.push({
            type: 'alias',
            url: '',
            path: ''
        });
    };

    /**
     * Adds a directory for a vhost.
     *
     */
    VirtualHost.prototype.addDirectory = function() {
        this.directories.push({
            path: '',
            allow_override: ko.observableArray(),
            options: ko.observableArray()
        });
    };

    return VirtualHost;
});