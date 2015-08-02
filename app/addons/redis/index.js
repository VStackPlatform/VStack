define(['plugins/router', 'knockout', 'ko-validation', 'ko-postbox', 'lib/models/Addon' , 'bindings/select2'], function(router, ko, validation, postbox, Addon) {

    var Redis = Addon.extend({
        init: function () {
            this._super('redis');
        }
    });

    var obj = new Redis();

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

    return obj;
});