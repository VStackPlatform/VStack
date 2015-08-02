define(['addons/apache/lib/models/VirtualHost'], function(VirtualHost) {
    var Apache = function() {
        this.install = ko.observableArray();
        this.options = {
            mpm: 'event',
            modules: [],
            vhosts: [
                new VirtualHost({
                    name: 'localdev',
                    serveraliases: ['www.localdev'],
                    docroot: '/var/www',
                    port: '80',
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
                    ]
                })
            ]
        }
    }
});