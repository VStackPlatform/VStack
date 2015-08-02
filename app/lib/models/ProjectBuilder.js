/**
 * The Project Builder.
 *
 * Created by damian on 15/05/15.
 */
define(['lib/models/Vagrant', 'lib/environment', 'durandal/app'], function(Vagrant, env, app) {

    var fs = require('fs');
    var q = require('q');
    var handlebars = require('handlebars');
    var ncp = require('ncp').ncp;
    var basePath = process.cwd();
    var tplPath = basePath + env.pathSeparator() + 'templates';
    var exec = require('child_process').exec;
    var rimraf = require('rimraf');

    handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

        if (arguments.length < 3)
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

        var operator = options.hash.operator || "==";

        var operators = {
            '==':       function(l,r) { return l == r; },
            '===':      function(l,r) { return l === r; },
            '!=':       function(l,r) { return l != r; },
            '<':        function(l,r) { return l < r; },
            '>':        function(l,r) { return l > r; },
            '<=':       function(l,r) { return l <= r; },
            '>=':       function(l,r) { return l >= r; },
            'typeof':   function(l,r) { return typeof l == r; }
        };

        if (!operators[operator])
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

        var result = operators[operator](lvalue, rvalue);

        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });

    /**
     * Create a directory.
     *
     * @param path
     * @returns {*}
     */
    var buildDirectory = function(path) {
        var deferred = q.defer();
        fs.mkdir(path, function(err) {
            console.log('created path:', path);
            if (err) {
                switch (err.code) {
                    case 'EEXIST':
                        deferred.resolve(path);
                        break;
                    case 'EACCES':
                    default:
                        deferred.reject('Unable to create directory at the specified location.');

                }
            } else {
                deferred.resolve(path);
            }
        });
        return deferred.promise;
    };

    /**
     * Does a rm -rf on a directory (simplest solution)
     * @param path The path to remove.
     * @returns {*|promise}
     */
    var forceRemoveDirectory = function(path) {

        var deferred = q.defer();
        rimraf(path, function(err) {
            console.log('removing directory recursively: ', path);
            if (err) {
                console.error(err);
                deferred.reject('Unable to remove directory and files.');
            }
            deferred.resolve(path);
        });
        return deferred.promise;
    };

    /**
     * Creates a file generated from a template using handlebars.
     * @param {string} tpl The path to the template.
     * @param {string} dest The destination of the file to output to.
     * @param {object} data The data to use in the template.
     */
    var createFileFromTemplate = function(tpl, dest, data) {
        var deferred = q.defer();
        fs.readFile(tpl, function (err, source) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                var template = handlebars.compile(source.toString('utf8'));
                var doc = template(data);
                fs.writeFile(dest, doc, function(err) {
                    if (err) {
                        deferred.reject(new Error(err));
                    } else {
                        console.log('created from template: ', dest);
                        deferred.resolve(true);
                    }
                });
            }
        });
        return deferred.promise;
    };

    /**
     * Copies a file.
     *
     * @param {string} start Path to the file to copy.
     * @param {string} dest The destination path.
     */
    var copyFile = function(start, dest) {
        var deferred = q.defer();
        fs.readFile(start, function (err, source) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                fs.writeFile(dest, source, function(err) {
                    if (err) {
                        deferred.reject(new Error(err));
                    } else {
                        console.log('copied file from ' + start + ' to ', dest);
                        deferred.resolve(true);
                    }
                });
            }
        });
        return deferred.promise;
    };

    /**
     * Builds the project files.
     *
     * @param {string} projectName The name of the project.
     * @param {string} fullPath The full path to where the files reside.
     * @param {object} settings The settings for the project.
     * @constructor
     */
    var ProjectBuilder = function(projectName, fullPath, settings) {
        this.projectName = projectName;
        this.fullPath = fullPath;
        this.settings = settings;
    };

    /**
     * Creates the main project directory.
     *
     * @returns {bool}
     */
    ProjectBuilder.prototype.createProjectDirectory = function() {
        var deferred = q.defer();

        fs.mkdir(this.fullPath, function(err) {
            if (err) {
                switch (err.code) {
                    case 'EEXIST': //if directory already exists we still want to continue.
                        var dialogPromise = app.showMessage(
                            'A project already exists at this location.' +
                            ' If you continue any custom changes maybe overwritten. Continue?',
                            'Directory Exists',
                            ['Yes', 'No']
                        );
                        dialogPromise.then(function (result) {
                            if (result == 'No') {
                                deferred.reject('user cancelled');
                            } else {
                                deferred.resolve(true);
                            }
                        });
                        break;
                    case 'EACCES':
                        deferred.reject('Can not create project directory. Permission denied.');
                        break;
                }
            } else {
                console.log('no error');
                deferred.resolve(true);
            }
        });

        return deferred.promise;
    };

    /**
     * Creates the Vagrantfile for vagrant.
     *
     * @returns {bool}
     */
    ProjectBuilder.prototype.createVagrantFile = function() {
        var deferred = q.defer();
        var vagrantTpl = tplPath + env.pathSeparator() + 'Vagrantfile';
        var vagrantPath = this.fullPath + env.pathSeparator() + 'Vagrantfile';
        var self = this;

        //Select the template according to the type selected and any extra settings needed.
        switch (this.settings.target.type) {
            case 'do':
                vagrantTpl += '-do';
                break;
            case 'locally':
            default:
                vagrantTpl += '-local';
                break;
        }

        self.settings.projectName = this.projectName;

        //Create Vagrantfile from template.
        createFileFromTemplate(vagrantTpl, vagrantPath, self.settings).then(
            function(success) {
                deferred.resolve(success);
            },
            function(err) {
                deferred.reject(new Error(err));
            }
        );

        return deferred.promise;
    };

    /**
     * Removes the node folder to repopulate modules.
     *
     * @param path The path where the node folder sits.
     * @returns {*|promise}
     */
    ProjectBuilder.prototype.removeNodesFolder = function(path) {
        var deferred = q.defer();
        forceRemoveDirectory(path + env.pathSeparator() + 'manifests')
            .then(function() {
                deferred.resolve(path);
            });
        return deferred.promise;
    };

    /**
     * Creates the puppet file structure.
     *
     * @returns {bool}
     */
    ProjectBuilder.prototype.createPuppetFiles = function() {
        var deferred = q.defer();
        var self = this;
        self.createConfig();
        buildDirectory(this.fullPath + env.pathSeparator() + 'www')
        .then(buildDirectory(this.fullPath + env.pathSeparator() + 'scripts')
        .then(function(path) {
            return self.copyScripts(path);
        }))
        .then(buildDirectory(this.fullPath + env.pathSeparator() + 'puppet')
        .then(function(path) {
            return self.removeNodesFolder(path)
        })
        .then(function(path) {
            return q.all([
                self.createLibrarianFile(path),
                buildDirectory(path + env.pathSeparator() + 'manifests')
                    .then(function(path) {
                        return self.copyNodes(path);
                    }),
                buildDirectory(path + env.pathSeparator() + 'modules')
            ])
        })
        .then(function() {
            deferred.resolve(true);
        }));
        return deferred.promise;
    };

    /**
     * Creates Puppet librarian file.
     *
     * @param path
     * @returns {*|promise}
     */
    ProjectBuilder.prototype.createLibrarianFile = function(path) {
        var deferred = q.defer();

        var data = {
            modules: [
                { mod: 'puppetlabs/puppetlabs-stdlib', tag: '4.6.0' },
                { mod: 'puppetlabs/puppetlabs-ntp', tag: '3.3.0' },
                { mod: 'puppetlabs/puppetlabs-apt', tag: '2.0.1' },
                { mod: 'maestrodev/puppet-rvm', tag: 'v1.12.0' },
                { mod: 'dhoppe/puppet-bash', tag: '1.0.4' },
                { mod: 'damiandennis/vstack', tag: '0.0.2' }
            ]
        };
        if (this.settings.webServer.apache) {
            data.modules.push({ mod: 'puppetlabs/puppetlabs-apache', tag: '1.5.0' });
        }
        if (this.settings.webServer.nginx) {
            data.modules.push({ mod: 'damiandennis/pp-nginx', tag: 'a09be7bd607582bf2e53e93ec9b2f628c1ed2f07' });
        }
        if (this.settings.language.php) {
            data.modules.push({ mod: 'damiandennis/puppet-php', tag: '2.0.24' });
            if (this.settings.language.php_options.mpm != 'prefork') {
                data.modules.push({mod: 'Slashbunny/puppet-phpfpm', tag: '0c268a93cc1f3415016a7008c0c0814ed28fa450'});
            }
            if (this.settings.language.php_options.composer == 1) {
                data.modules.push({ mod: 'tPl0ch/puppet-composer', tag: '1.3.6' });
            }
        }
        if (this.settings.database.mysql) {
            data.modules.push({ mod: 'puppetlabs/puppetlabs-mysql', tag: '3.3.0' });
        }
        if (this.settings.database.redis) {
            data.modules.push({ mod: 'echocat/puppet-redis', tag: 'v1.6.0' });
        }

        var libraryTpl = tplPath + env.pathSeparator() + 'puppet' + env.pathSeparator() + 'Puppetfile';
        var libraryPath = path + env.pathSeparator() + 'Puppetfile';

        //Create Puppetfile from template.
        createFileFromTemplate(libraryTpl, libraryPath, data).then(
            function(success) {
                deferred.resolve(success);
            },
            function(err) {
                deferred.reject(new Error(err));
            }
        );


        return deferred.promise;
    };

    ProjectBuilder.prototype.copyFiles = function() {
        var deferred = q.defer();
        var siteFile = tplPath + env.pathSeparator() + 'files';
        var sitePath = this.fullPath + env.pathSeparator() + 'files';
        ncp(siteFile, sitePath, function (err) {
            if (err) {
                deferred.reject(new Error(err));
            }
            deferred.resolve(true);
        });
        return deferred.promise;
    };

    ProjectBuilder.prototype.copyHiera = function() {
        var deferred = q.defer();
        var hieraFile = tplPath + env.pathSeparator() + 'hiera.yaml';
        var hieraPath = this.fullPath + env.pathSeparator() + 'hiera.yaml';
        copyFile(hieraFile, hieraPath).then(
            function(success) {
                deferred.resolve(success);
            },
            function(err) {
                deferred.reject(new Error(err));
            }
        );
        return deferred.promise;
    };

    ProjectBuilder.prototype.createConfig = function() {
        var deferred = q.defer();
        try {

            var configPath = this.fullPath + env.pathSeparator() + 'config.json';
            var configData = {
                projectName: this.projectName
            };
            if (this.settings.system.packages.length > 0) {
                configData.packages = this.settings.system.packages;
            }
            if (this.settings.system.users.length > 0) {
                configData.packages = this.settings.system.users;
            }
            if (this.settings.system.groups.length > 0) {
                configData.packages = this.settings.system.groups;
            }
            if (this.settings.webServer.apache == 1) {
                configData.apache = this.settings.webServer.apache_options;
            }
            if (this.settings.webServer.nginx == 1) {
                try {
                    var nginx_data = this.settings.webServer.nginx_options;
                    // Need to put content in format for nginx puppet configuration.
                    // TODO: change puppet module to suit per directive instead of block of code.
                    nginx_data.sites.forEach(function (site, sitekey) {
                        site.upstreams.forEach(function (server, key) {
                            var directives = [];
                            server.directives.forEach(function (directive) {
                                directives.push(directive.directive[0] + ' ' + directive.value);
                            });
                            nginx_data.sites[sitekey].upstreams[key].directives = directives;
                        });
                        site.servers.forEach(function (server, key) {
                            var directives = [];
                            directives.push('server_name ' + server.server_name);
                            directives.push('listen ' + server.listen);
                            server.directives.forEach(function (directive) {
                                directives.push(directive.directive[0] + ' ' + directive.value);
                            });
                            nginx_data.sites[sitekey].servers[key].directives = directives;
                            server.locations.forEach(function (location, index) {
                                if (location.directives !== undefined) {
                                    var location_directives = [];
                                    location.directives.forEach(function (l_directive) {
                                        location_directives.push(l_directive.directive[0] + ' ' + l_directive.value);
                                    });
                                    nginx_data.sites[sitekey].servers[key].locations[index].directives = location_directives;
                                }
                            });
                        });
                    });
                    configData.nginx = nginx_data;
                } catch (e) {
                    console.error(e);
                    console.error(e.stack);
                }
            }
            if (this.settings.database.mysql == 1) {
                configData.mysql = this.settings.database.mysql_options;
            }
            if (this.settings.database.redis == 1) {
                configData.redis = this.settings.database.redis_options;
            }
            if (this.settings.language.php == 1) {
                configData.php = this.settings.language.php_options;
            }
            if (this.settings.language.nodejs == 1) {
                configData.nodejs = this.settings.language.nodejs_options;
            }
            configData.ruby = this.settings.language.ruby_options;
            fs.writeFile(configPath, JSON.stringify(configData, null, 4), function (err) {
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    deferred.resolve(true);
                }
            });
        } catch (err) {
            deferred.reject(err);
        }
        return deferred.promise;
    };

    ProjectBuilder.prototype.copyNodes = function(path) {
        var deferred = q.defer();

        var nodes = [
            '01_apt.pp',
            '02_bash.pp',
            '06_ruby.pp'
        ];

        if (this.settings.system.users.length > 0) {
            nodes.push(['03_users.pp']);
        }

        if (this.settings.system.groups.length > 0) {
            nodes.push(['04_groups.pp']);
        }

        if (this.settings.system.packages.length > 0) {
            nodes.push(['05_packages.pp']);
        }

        if (this.settings.language.php) {
            nodes.push(['09_php.pp']);
            if (this.settings.language.php_options.composer == 1) {
                nodes.push(['10_composer.pp']);
            }
        }

        if (this.settings.language.nodejs) {
            nodes.push(['12_nodejs.pp']);
        }

        if (this.settings.webServer.apache) {
            nodes.push(['07_apache.pp']);
        }

        if (this.settings.webServer.nginx) {
            nodes.push(['08_nginx.pp']);
        }

        if (this.settings.database.mysql) {
            nodes.push(['11_mysql.pp']);
        }

        if (this.settings.database.redis) {
            nodes.push(['13_redis.pp']);
        }

        var nodePath = [tplPath, 'puppet', 'manifests'].join(env.pathSeparator());
        var count = 0;
        for (var i in nodes) {
            copyFile(nodePath + env.pathSeparator() + nodes[i], path + env.pathSeparator() + nodes[i]).then(
                function(success) {
                    count++;
                    if (count == nodes.length) {
                        deferred.resolve(success);
                    }
                },
                function(err) {
                    deferred.reject(new Error(err));
                }
            );
        }

        return deferred.promise;
    };

    ProjectBuilder.prototype.copyScripts = function(path) {
        var deferred = q.defer();
        var scriptsPath = tplPath + env.pathSeparator() + 'scripts' + env.pathSeparator();
        q.all([
            buildDirectory(path + env.pathSeparator() + 'exec-once'),
            copyFile(scriptsPath + 'pre-puppet.sh', path + env.pathSeparator() + 'pre-puppet.sh'),
            copyFile(scriptsPath + 'post-puppet.sh', path + env.pathSeparator() + 'post-puppet.sh')
        ]).then(function() {
            deferred.resolve(path);
        }, function(err) {
            deferred.reject(new Error(err));
        });
        return deferred.promise;
    };


    return ProjectBuilder;
});