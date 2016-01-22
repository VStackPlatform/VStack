define(function(require) {

    var ko = require('knockout'),
        mapping = require('ko-mapping'),
        Directory = require('addons/apache/lib/models/Directory'),
        Alias = require('addons/apache/lib/models/Alias');

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

        mapping.fromJS(data, {
            "directories": {
                create: function(options) {
                    return new Directory(options.data);
                }
            },
            "aliases": {
                create: function(options) {
                    return new Alias(options.data);
                }
            }
        }, this);

        this.directoryModel = Directory;
        this.aliasModel = Alias;


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

    return VirtualHost;
});