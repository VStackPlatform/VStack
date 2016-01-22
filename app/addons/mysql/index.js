define(function(require) {

    require('bindings/select2');
    require('components/c-nav/c-nav');

    var router = require('plugins/router');
    var ko = require('knockout');
    var validation = require('ko-validation');
    var postbox = require('ko-postbox');
    var User = require('addons/mysql/lib/models/User');
    var Addon = require('app-lib/models/Addon');
    var mapping = require('ko-mapping');
    var Grant = require('addons/mysql/lib/models/Grant');

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
                                    },
                                    "grants": {
                                        "create": function (model) {
                                            return new Grant(model.data);
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

                this.enableLiveUpdates();

                /**
                 * If we are installing mysql then validate conditions are true.
                 */
                var requiredValidate = function () {
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
                    this.data().options.users.push(new User());
                }.bind(this);

                /**
                 * Removes the specified user.
                 *
                 * @param model The model to remove.
                 * @param event The event
                 */
                this.removeUser = function(model, event) {
                    this.data().options.users.remove(model);
                }.bind(this);

                /**
                 * Only users that are fully validated.
                 */
                this.validUsers = ko.pureComputed(function() {
                    return ko.utils.arrayFilter(this.data().options.users(), function(user) {
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
                this.showGrants = ko.pureComputed(function() {
                    var users = this.validUsers().length;
                    var databases = this.data().options.databases().length;
                    return databases > 0 && users > 0;
                }, this);


                /**
                 * Adds a new grant to config.
                 */
                this.addGrant = function() {
                    this.data().options.grants.push(new Grant({
                        username: ko.observable(''),
                        database: ko.observable(''),
                        table: ko.observable('*'),
                        privileges: ko.observableArray(['ALL'])
                    }));
                }.bind(this);

                this.rootPassVisible = ko.observable(false);

                this.rootPassText = ko.pureComputed(function() {
                    return this.rootPassVisible() ? 'Hide' : 'Show';
                }, this);

                this.rootPassType = ko.pureComputed(function() {
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
                    this.data().options.grants.remove(model);
                }.bind(this);

            },
            database_config: {
                placeholder: 'Enter Databases to create',
                tags: ['mydb'],
                tokenSeparators: [',', ' ']
            }
        });

        return MySQL;

    } catch (e) {
        console.error(e.stack);
    }
});