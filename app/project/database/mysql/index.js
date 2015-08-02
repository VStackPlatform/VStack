define([
    'plugins/router',
    'knockout',
    'ko-validation',
    'bindings/select2',
    'ko-postbox',
    'addons/mysql/lib/models/User'
], function() {

    var router = requirejs('plugins/router');
    var ko = requirejs('knockout');
    var validation = requirejs('ko-validation');
    var User = requirejs('addons/mysql/lib/models/User');

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

        /**
         * Move to previous section.
         */
        obj.prev = function() {
            router.navigate(obj.project().editUrl() + '/nginx');
        };

        /**
         * move to next section
         */
        obj.next = function() {
            router.navigate(obj.project().editUrl() + '/redis');
        };

        /**
         * Adds a new user to config.
         */
        obj.addUser = function() {
            obj.project().settings().database.mysql_options.users.push(new User());
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
            return ko.utils.arrayFilter(this.options().users(), function(user) {
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

        obj.rootPassVisible = ko.observable(false);

        obj.rootPassText = ko.computed(function() {
            return this.rootPassVisible() ? 'Hide' : 'Show';
        }, obj);

        obj.rootPassType = ko.computed(function() {
            return this.rootPassVisible() ? 'text' : 'password';
        }, obj);

        obj.toggleRootPassVisible = function(model, event) {
            this.rootPassVisible(!this.rootPassVisible());
        }.bind(obj);

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