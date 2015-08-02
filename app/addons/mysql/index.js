define([
    'plugins/router',
    'knockout',
    'ko-validation',
    'ko-postbox',
    'addons/mysql/lib/models/User',
    'lib/models/Addon',
    'ko-mapping',
    'bindings/select2'
], function(router, ko, validation, postbox, User, Addon, mapping) {

    try {
        var MySQL = Addon.extend({
            init: function () {
                this._super('mysql', {
                    "options": {
                        create: function (options) {
                            return new function () {
                                mapping.fromJS(options.data, {
                                    "users": {
                                        "create": function (model) {
                                            return new User(model.data);
                                        }
                                    }
                                }, this);
                                this.toJSON = function() {
                                    return mapping.toJS(this);
                                };
                            };
                        }
                    }
                });

                /**
                 * Whether to install this node or not.
                 */
                if (this.settings().install !== undefined) {
                    this.install = ko.computed({
                        read: function () {
                            return this.settings().install();
                        }.bind(this),
                        write: function (val) {
                            this.settings().install(val);
                        }.bind(this)
                    });
                }

                /**
                 * Options for configuring this node.
                 */
                this.options = ko.computed({
                    read: function() {
                        return this.settings().options;
                    }.bind(this),
                    write: function(val) {
                        this.settings().options = val;
                    }.bind(this)
                });

                /**
                 * If we are installing mysql then validate conditions are true.
                 */
                var requiredValidate = function (target) {
                    return {
                        required: {
                            onlyIf: function () {
                                return this.install() == true;
                            }.bind(this)
                        }
                    };
                }.bind(this);

                /**
                 * Adds a new user to config.
                 */
                this.addUser = function() {
                    this.options().users.push(new User());
                }.bind(this);

                /**
                 * Removes the specified user.
                 *
                 * @param model The model to remove.
                 * @param event The event
                 */
                this.removeUser = function(model, event) {
                    this.options().users.remove(model);
                }.bind(this);

                /**
                 * Only users that are fully validated.
                 */
                this.validUsers = ko.computed(function() {
                    return ko.utils.arrayFilter(this.options().users(), function(user) {
                        var group = validation.group(user);
                        return group().length == 0;
                    });
                }, this);

                this.userHost = function(model) {
                    return model.username() + '@' + model.host();
                };

                /**
                 * When to show the grants section.
                 */
                this.showGrants = ko.computed(function() {
                    var users = this.validUsers().length;
                    var databases = this.options().databases().length;
                    return databases > 0 && users > 0;
                }, this);


                /**
                 * Adds a new grant to config.
                 */
                this.addGrant = function() {
                    this.options().grants.push({
                        username: '',
                        database: '',
                        table: '*',
                        privileges: ko.observableArray(['ALL'])
                    });
                }.bind(this);

                this.rootPassVisible = ko.observable(false);

                this.rootPassText = ko.computed(function() {
                    return this.rootPassVisible() ? 'Hide' : 'Show';
                }, this);

                this.rootPassType = ko.computed(function() {
                    return this.rootPassVisible() ? 'text' : 'password';
                }, this);

                this.toggleRootPassVisible = function(model, event) {
                    this.rootPassVisible(!this.rootPassVisible());
                }.bind(this);

                /**
                 * Removes the specified grant.
                 *
                 * @param model The model to remove.
                 * @param event The event
                 */
                this.removeGrant = function(model, event) {
                    this.options().grants.remove(model);
                }.bind(this);

                /**
                 * Save back to main project on change.
                 */
                ko.computed(function() {
                    this.project().settings.peek()[this.name] = mapping.toJS(this.settings());
                    console.log(this.project().settings());
                }, this);

            },
            database_config: {
                placeholder: 'Enter Databases to create',
                tags: ['mydb'],
                tokenSeparators: [',', ' ']
            }
        });

        return new MySQL();

    } catch (e) {
        console.error(e.stack);
    }
});