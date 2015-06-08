/**
 * Created by damian on 8/06/15.
 */
define(['plugins/router', 'knockout', 'jquery', 'bindings/select2', 'ko-postbox'], function(router, ko, $, project) {
    try {
        var obj = {
            project: ko.observable().syncWith('project.main', true),
            gemsConfig: {
                placeholder: 'Gems to install',
                tags: ['sass', 'less'],
                tokenSeparators: [',', ' ']
            }
        };

        /**
         * Various php options.
         */
        obj.options = ko.computed({
            read: function () {
                return this.project().settings().language.ruby_options;
            },
            write: function (val) {
                this.project().settings().language.ruby_options = val;
            }
        }, obj);

        /**
         * Go to previous screen.
         */
        obj.prev = function () {
            router.navigate(obj.project().editUrl() + '/php');
        };

        /**
         * Go to next screen.
         */
        obj.next = function () {
            router.navigate(obj.project().editUrl() + '/nodejs');
        };

    } catch (e) {
        console.error(e.stack);
    }
    return obj;
});