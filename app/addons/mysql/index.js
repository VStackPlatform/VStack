define([
    'plugins/router',
    'knockout',
    'ko-validation',
    'ko-postbox',
    'addons/mysql/lib/models/User',
    'app-lib/models/Addon',
    'ko-mapping',
    'bindings/select2'
],
function(router, ko, validation, postbox, User, Addon, mapping) {

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
                this.validUsers = ko.computed(function() {
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
                this.showGrants = ko.computed(function() {
                    var users = this.validUsers().length;
                    var databases = this.data().options.databases().length;
                    return databases > 0 && users > 0;
                }, this);


                /**
                 * Adds a new grant to config.
                 */
                this.addGrant = function() {
                    this.data().options.grants.push({
                        username: ko.observable(''),
                        database: ko.observable(''),
                        table: ko.observable('*'),
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