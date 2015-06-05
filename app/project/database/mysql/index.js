/**
 * Created by damian on 9/05/15.
 */
define(['plugins/router', 'knockout', 'ko-validation', 'bindings/select2', 'ko-postbox'], function(router, ko, validation) {

    try {
        var obj = {
            project: ko.observable().syncWith('project.main', true),
            database_config: {
                placeholder: 'Enter Databases to create',
                tags: ['mydb'],
                tokenSeparators: [',', ' ']
            }
        };

        /**
         * If we are installing mysql then validate conditions are true.
         */
        var requiredValidate = function (target) {
            return {
                required: {
                    onlyIf: function () {
                        return this.mysql() == true;
                    }.bind(this)
                }
            };
        }.bind(obj);

        /**
         * If we should or should not install mysql.
         */
        obj.mysql = ko.computed({
            read: function() {
                return this.project().settings().database.mysql();
            },
            write: function(val) {
                this.project().settings().database.mysql(val);
            }
        }, obj);

        /**
         * Pull in the options from the global config to make it simpler to write in templates.
         */
        obj.options = ko.computed({
            read: function() {
                return this.project().settings().database.mysql_options;
            },
            write: function(val) {
                this.project().settings().database.mysql_options = val;
            }
        }, obj);

        /*
         * Make sure that first row has validators (could be the default).
         */
        if (obj.options().users().length) {
            obj.options().users()[0].username.extend(requiredValidate());
            obj.options().users()[0].host.extend(requiredValidate());
            obj.options().users()[0].password.extend(requiredValidate());
        }

        /**
         * Move to previous section.
         */
        obj.prev = function() {
            router.navigate(obj.project().editUrl() + '/apache');
        };

        /**
         * move to next section
         */
        obj.next = function() {
            router.navigate(obj.project().editUrl() + '/php');
        };

        /**
         * Adds a new user to config.
         */
        obj.addUser = function() {
            obj.project().settings().database.mysql_options.users.push({
                username: ko.observable('').extend(requiredValidate()),
                host: ko.observable('localhost').extend(requiredValidate()),
                password: ko.observable('').extend(requiredValidate())
            });
        };

        /**
         * Removes the specified user.
         *
         * @param model The model to remove.
         * @param event The event
         */
        obj.removeUser = function(model, event) {
            obj.project().settings().database.mysql_options.users.remove(model);
        };

        /**
         * Only users that are fully validated.
         */
        obj.validUsers = ko.computed(function() {
            return  ko.utils.arrayFilter(this.options().users(), function(user) {
                var group = validation.group(user);
                return group().length == 0;
            });
        }, obj);

        obj.userHost = function(model) {
            return model.username() + '@' + model.host();
        };

        /**
         * When to show the grants section.
         */
        obj.showGrants = ko.computed(function() {
            var users = this.validUsers().length;
            var databases = this.options().databases().length;
            return databases > 0 && users > 0;
        }, obj);


        /**
         * Adds a new grant to config.
         */
        obj.addGrant = function() {
            obj.project().settings().database.mysql_options.grants.push({
                username: '',
                database: '',
                table: '*',
                privileges: ko.observableArray(['ALL'])
            });
        };

        /**
         * Removes the specified grant.
         *
         * @param model The model to remove.
         * @param event The event
         */
        obj.removeGrant = function(model, event) {
            obj.project().settings().database.mysql_options.grants.remove(model);
        };

        return obj;
    } catch (e) {
        console.error(e.stack);
    }
});