define([], function() {
    return {
        version: 2,
        minVersion: '1.6.0',
        target: {
            type: 'locally',
            local_options: {
                provider: 'virtualbox',
                distribution: 'ubuntu/trusty64',
                ip: '192.168.56.101',
                hostname: 'localdev',
                memory: '512',
                cpu_count: '1',
                checkForUpdates: true,
                gui: false,
                forward_ports: [
                    {
                        host: '8616',
                        vm: '22'
                    }
                ],
                synced_folders: [
                    {
                        from: './www',
                        to: '/var/www',
                        type: "default",
                        owner: 'www-data',
                        group: 'www-data'
                    }
                ]
            },
            do_options: {
                distribution: 'ubuntu/trusty64',
                server_size: '512mb',
                server_name: 'master',
                data_center: 'nyc1',
                token: 'DIGITAL_OCEAN_TOKEN',
                ssh_key_name: 'Vagrant',
                private_key_path: '~/.ssh/id_rsa',
                private_key_user: 'PRIVATE_KEY_USER',
                synced_folders: []
            }
        },
        system: {
            packages: [],
            users: [],
            groups: []
        },
        webServer: {
            apache: true,
            apache_options: {
                modules: [],
                vhosts: [
                    {
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
                    }
                ]
            }
        },
        database: {
            mysql: true,
            mysql_options: {
                version: '5.5',
                root_password: '',
                databases: [],
                users: [
                    {
                        username: '',
                        host: 'localhost',
                        password: ''
                    }
                ],
                grants: [
                    {
                        username: '',
                        database: '',
                        table: '*',
                        privileges: ['ALL']
                    }
                ]
            }
        },
        language: {
            php: true,
            php_options: {
                version: '5.5',
                composer: true,
                composer_options: {
                    github_token: ''
                },
                ini_settings: {
                    'display_errors': 'On',
                    'error_reporting': '-1',
                    'date.timezone': 'UTC'
                },
                modules: ['cli', 'intl', 'mcrypt'],
                pecl: [],
                pear: [],
                xdebug: true,
                xdebug_options: {
                    settings: {
                        'xdebug.default_enable': 1,
                        'xdebug.remote_autostart': 0,
                        'xdebug.remote_connect_back': 1,
                        'xdebug.remote_enable': 1,
                        'xdebug.remote_handler': 'dbgp',
                        'xdebug.remote_port': 9000
                    }
                }
            },
            nodejs: false,
            nodejs_options: {
                version: '0.12.4',
                npm: ['bower', 'gulp']
            },
            ruby: true,
            ruby_options: {
                gems: []
            }
        }
    };
});