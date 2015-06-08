/**
 * Created by damian on 7/06/15.
 */
define(['plugins/router', 'knockout', 'jquery', 'bindings/select2', 'ko-postbox'], function(router, ko, $) {
    try {
        var obj = {
            project: ko.observable().syncWith('project.main', true),
            npmConfig: {
                placeholder: 'NPM Packages',
                tags: [''],
                tokenSeparators: [',', ' ']
            }
        };

        /**
         * Whether to install nodejs or not.
         */
        obj.nodejs = ko.computed({
            read: function () {
                return this.project().settings().language.nodejs();
            },
            write: function (val) {
                this.project().settings().language.nodejs(val);
            }
        }, obj);

        /**
         * Various nodejs options.
         */
        obj.options = ko.computed({
            read: function () {
                return this.project().settings().language.nodejs_options;
            },
            write: function (val) {
                this.project().settings().language.nodejs_options = val;
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
            if (obj.project().settings().target.type() == 'do') {
                router.navigate(obj.project().editUrl() + '/do');
            } else {
                router.navigate(obj.project().editUrl() + '/local');
            }
        };

        return obj;

    } catch (e) {
        console.error(e.stack);
    }
});