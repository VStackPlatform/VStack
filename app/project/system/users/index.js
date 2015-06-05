/**
 * Created by damian on 9/05/15.
 */
define(['plugins/router', 'knockout', 'jquery', 'bindings/select2', 'ko-postbox'], function(router, ko, $) {
    var obj = {
        project: ko.observable().syncWith('project.main', true),
        users_config: {
            placeholder: 'Enter Users',
            tags: [],
            tokenSeparators: [',', ' ']
        },
        groups_config: {
            placeholder: 'Enter Groups',
            tags: [],
            tokenSeparators: [',', ' ']
        }
    };
    obj.users = ko.computed({
        read: function() {
            return this.project().settings().system.users();
        },
        write: function(val) {
            this.project().settings().system.users(val);
        }
    }, obj);
    obj.groups = ko.computed({
        read: function() {
            return this.project().settings().system.groups();
        },
        write: function(val) {
            this.project().settings().system.groups(val);
        }
    }, obj);

    obj.prev = function() {
        router.navigate(obj.project().editUrl() + '/packages');
    };
    obj.next = function() {
        router.navigate(obj.project().editUrl() + '/apache');
    };

    return obj;
});