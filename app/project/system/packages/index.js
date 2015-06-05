/**
 * Created by damian on 9/05/15.
 */
define(['plugins/router', 'knockout', 'jquery', 'bindings/select2', 'ko-postbox'], function(router, ko, $) {
    var obj = {
        project: ko.observable().syncWith('project.main', true),
        packages_config: {
            placeholder: 'Enter system packages',
            tags: ['vim', 'htop'],
            tokenSeparators: [',', ' ']
        }
    };
    obj.packages = ko.computed({
        read: function() {
            return this.project().settings().system.packages();
        },
        write: function(val) {
            this.project().settings().system.packages(val);
        }
    }, obj);
    obj.prev = function() {
        if (obj.project().settings().target.type() == 'do') {
            router.navigate(obj.project().editUrl() + '/do');
        } else {
            router.navigate(obj.project().editUrl() + '/local');
        }
    };
    obj.next = function() {
        router.navigate(obj.project().editUrl() + '/users');
    };
    return obj;
});