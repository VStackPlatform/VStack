/**
 * The Project Builder.
 *
 * Created by damian on 15/05/15.
 */
define([
    'lib/models/Vagrant',
    'lib/environment',
    'durandal/app',
    'lib/models/Addon',
    'ko-mapping'
],
function(Vagrant, env, app, Addon, mapping) {

    var fs = require('fs');
    var q = require('q');
    var handlebars = require('handlebars');
    var ncp = require('ncp').ncp;
    var basePath = process.cwd();
    var tplPath = env.buildPath([basePath,'templates']);
    var addonPath = env.buildPath([basePath, 'app', 'addons']);
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

    var fetchTemplateData = function(tpl, data) {
        var deferred = q.defer();
        fs.readFile(tpl, function (err, source) {
            if (err) {
                deferred.reject(new Error(err));
            } else {
                var template = handlebars.compile(source.toString('utf8'));
                deferred.resolve(template(data));
            }
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
        fetchTemplateData(tpl, data).then(function(tplData){
            fs.writeFile(dest, tplData, function(err) {
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    console.log('created from template: ', dest);
                    deferred.resolve(true);
                }
            });
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
     * @returns {function}
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

    ProjectBuilder.prototype.getVagrantTemplates = function() {
        var deferred = q.defer();
        var self = this;
        var files = {
            headers: [],
            bodies: [],
            footers: []
        };
        fetchTemplateData(env.buildPath([tplPath, 'vagrant', 'header.hbs']), {
            version: 2,
            minVersion: '1.7.3'
        }).then(function(data) {
            files.headers.push(data);
            fetchTemplateData(env.buildPath([tplPath, 'vagrant', 'footer.hbs']), self.settings).then(function(data) {
                files.footers.push(data);
                Addon.findEnabled().then(function(addons) {
                    var count = 0;
                    addons.forEach(function(addon) {
                        var vagrantPath = env.buildPath([addonPath, addon.name, 'vagrant']);
                        fs.exists(vagrantPath, function (folderExists) {
                            if (folderExists) {
                                var headerFile = env.buildPath([vagrantPath, 'header.hbs']);
                                fs.exists(headerFile, function(headerExists) {
                                    if (headerExists) {
                                        fetchTemplateData(headerFile, self.settings).then(function(data) {
                                            files.headers.push(data);
                                            count++;
                                            if (addons.length * 3 == count) {
                                                deferred.resolve(files);
                                            }
                                        });
                                    } else {
                                        count++;
                                        if (addons.length * 3 == count) {
                                            deferred.resolve(files);
                                        }
                                    }
                                });
                                var bodyFile = env.buildPath([vagrantPath, 'body.hbs']);
                                fs.exists(bodyFile, function(bodyExists) {
                                    if (bodyExists) {
                                        fetchTemplateData(bodyFile, self.settings).then(function(data) {
                                            files.bodies.push(data);
                                            count++;
                                            if (addons.length * 3 == count) {
                                                deferred.resolve(files);
                                            }
                                        });
                                    } else {
                                        count++;
                                        if (addons.length * 3 == count) {
                                            deferred.resolve(files);
                                        }
                                    }
                                });
                                var footerFile = env.buildPath([vagrantPath, 'footer.hbs']);
                                fs.exists(footerFile, function(footerExists) {
                                    if (footerExists) {
                                        files.footers.push(footerFile);
                                        fetchTemplateData(footerFile, self.settings).then(function(data) {
                                            files.footers.push(data);
                                            count++;
                                            if (addons.length * 3 == count) {
                                                deferred.resolve(files);
                                            }
                                        });
                                    } else {
                                        count++;
                                        if (addons.length * 3 == count) {
                                            deferred.resolve(files);
                                        }
                                    }
                                });

                            } else {
                                count += 3; //Add on three to account for the three checks above.
                            }
                        });
                    });
                });
            });
        });

        return deferred.promise;
    };

    /**
     * Creates the Vagrantfile for vagrant.
     *
     * @returns {function}
     */
    ProjectBuilder.prototype.createVagrantFile = function() {
        var deferred = q.defer();
        var vagrantPath = env.buildPath([this.fullPath, 'Vagrantfile']);
        var self = this;
        self.settings.projectName = this.projectName;

        this.getVagrantTemplates().then(function(files) {
            var vagrantFile = '';
            vagrantFile += files.headers.join("\n") + "\n";
            vagrantFile += files.bodies.join("\n") + "\n";
            vagrantFile += files.footers.join("\n") + "\n";
            fs.writeFile(vagrantPath, vagrantFile, function(err) {
                if (err) {
                    deferred.reject(new Error(err));
                } else {
                    console.log('created Vagrantfile..');
                    deferred.resolve(true);
                }
            });

        }.bind(this));

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
        try {
            console.log('removing old nodes...');
            forceRemoveDirectory(path + env.pathSeparator() + 'manifests')
                .then(function() {
                    deferred.resolve(path);
                });
        } catch (e) {
            console.error(e);
            deferred.reject(e);
        }
        return deferred.promise;
    };

    /**
     * Creates the puppet file structure.
     *
     * @returns {function}
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
                buildDirectory(env.buildPath([path, 'manifests']))
                    .then(function(path) {
                        return self.copyNodes(path);
                    }),
                buildDirectory(path + env.pathSeparator() + 'modules')
            ]).catch(function(err){
                console.error(err);
            });
        })
        .then(function() {
            deferred.resolve(true);
        })).catch(function(err) {
            console.error(err);
        });
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

        console.log('creating librarian file...');
        try {
            var libraryTpl = env.buildPath([tplPath, 'puppet', 'Puppetfile']);
            var libraryPath = env.buildPath([path, 'Puppetfile']);
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

            Addon.findEnabled().then(function(addons) {
                addons.forEach(function(addon) {
                    addon.modules.forEach(function(module) {
                        data.modules.push(module);
                    });
                });

                //Create Puppetfile from template.
                createFileFromTemplate(libraryTpl, libraryPath, data).then(
                    function(success) {
                        deferred.resolve(success);
                    },
                    function(err) {
                        deferred.reject(new Error(err));
                    }
                );
            });
        } catch (e) {
           console.error(e);
           deferred.reject(e);
        }

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
            Addon.findEnabled().then(function(addons) {
                addons.forEach(function(addon) {
                    if (this.settings[addon.name] == undefined) {
                        this.settings[addon.name] = mapping.toJS(addon.data());
                    }
                }.bind(this));
                $.extend(configData, this.settings);
                fs.writeFile(configPath, JSON.stringify(configData, null, 4), function (err) {
                    if (err) {
                        deferred.reject(new Error(err));
                    } else {
                        console.log('created config file...');
                        deferred.resolve(true);
                    }
                });
            }.bind(this));

        } catch (err) {
            deferred.reject(err);
        }
        return deferred.promise;
    };

    ProjectBuilder.prototype.copyNodes = function(path) {
        var deferred = q.defer();
        var nodePath = env.buildPath([tplPath, 'puppet', 'manifests']);
        var count = 0;

        var nodes = [
            {
                from: env.buildPath([nodePath, 'core_apt.pp']),
                to: env.buildPath([path, 'core_apt.pp'])
            },
            {
                from: env.buildPath([nodePath, 'core_bash.pp']),
                to: env.buildPath([path, 'core_bash.pp'])
            }
        ];

        Addon.findEnabled().then(function(addons) {
            var addonDeferred = q.defer();
            var addonCount = 0;
            addons.forEach(function(addon) {
                var manifestsPath = env.buildPath([addonPath, addon.name, 'puppet', 'manifests']);
                fs.exists(manifestsPath, function(exists) {
                    if (exists) {
                        fs.readdir(manifestsPath, function(err, files) {
                            if (err) {
                                console.error(err);
                            }
                            files.forEach(function(file) {
                                nodes.push({
                                    from: env.buildPath([manifestsPath, file]),
                                    to: env.buildPath([path, addon.name + '_' + file])
                                });
                            });
                            addonCount++;
                            if (addonCount == addons.length) {
                                addonDeferred.resolve(true);
                            }
                        })
                    } else {
                        addonCount++;
                        if (addonCount == addons.length) {
                            addonDeferred.resolve(true);
                        }
                    }
                });
            });
            if (addons.length == 0) {
                addonDeferred.resolve(true);
            }
            return addonDeferred.promise;
        }).then(function() {
            for (var i in nodes) {
                copyFile(nodes[i].from, nodes[i].to).then(
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
        });

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