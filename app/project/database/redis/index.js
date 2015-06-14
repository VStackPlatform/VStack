/**
 * Created by damian on 9/05/15.
 */
define(['plugins/router', 'knockout', 'ko-validation', 'bindings/select2', 'ko-postbox'], function(router, ko, validation) {

    try {
        var obj = {
            project: ko.observable().syncWith('project.main', true)
        };

        /**
         * If we are installing mysql then validate conditions are true.
         */
        var requiredValidate = function (target) {
            return {
                required: {
                    onlyIf: function () {
                        return this.redis() == true;
                    }.bind(this)
                }
            };
        }.bind(obj);

        /**
         * If we should or should not install mysql.
         */
        obj.redis = ko.computed({
            read: function() {
                return this.project().settings().database.redis();
            },
            write: function(val) {
                this.project().settings().database.redis(val);
            }
        }, obj);

        /**
         * Pull in the options from the global config to make it simpler to write in templates.
         */
        obj.options = ko.computed({
            read: function() {
                return this.project().settings().database.redis_options;
            },
            write: function(val) {
                this.project().settings().database.redis_options = val;
            }
        }, obj);

        /**
         * Move to previous section.
         */
        obj.prev = function() {
            router.navigate(obj.project().editUrl() + '/mysql');
        };

        /**
         * move to next section
         */
        obj.next = function() {
            router.navigate(obj.project().editUrl() + '/php');
        };

        return obj;
    } catch (e) {
        console.error(e.stack);
    }
});