/**
 * CNav Model
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'plugins/router',
            'knockout',
            'ko-mapping',
            'components/models/Component'
        ], factory);
    }
}(this, function(router, ko, mapping, Component, postbox) {

    var CNav = Component.extend({
        init: function(params, componentInfo) {

            /*
             * Check that observables are only copied.
             */
            var fields = [];
            var jsonMap = {
                copy: ['type', 'name']
            };
            fields.forEach(function(value) {
                if (ko.isObservable(params[value])) {
                    jsonMap.copy.push(value);
                }
            });
            mapping.fromJS(params, jsonMap, this);

            this.project = ko.observable({settings: ko.observableArray()}).syncWith('project.main', true);
            this.sideNavTypes = ko.observableArray().subscribeTo('project.sideNavTypes', true);
            this.sideNavTypes().forEach(function (menuItem, key) {
                if (menuItem.name == this.type) {

                    var moduleKey = 0, moduleRoute;
                    menuItem.menu().forEach(function (item, index) {
                        if (item.route == this.name) {
                            moduleKey = index;
                            moduleRoute = item.route;
                        }
                    }.bind(this));

                    // If module has a previous module.
                    if (menuItem.menu()[moduleKey - 1] !== undefined) {
                        this.prev = function () {
                            router.navigate(this.project().editUrl() + '/' + menuItem.menu()[moduleKey - 1].route);
                        };
                    } else if (this.sideNavTypes()[key - 1] != undefined) {
                        this.prev = function () {
                            router.navigate(this.project().editUrl() + '/' + this.sideNavTypes()[key - 1].menu().pop().route);
                        }.bind(this);
                    } else {
                        this.prev = false
                    }

                    // If module has a next module.
                    if (menuItem.menu()[moduleKey + 1] !== undefined) {
                        this.next = function () {
                            router.navigate(this.project().editUrl() + '/' + menuItem.menu()[moduleKey + 1].route);
                        }.bind(this);
                    } else if (this.sideNavTypes()[key + 1] != undefined) {
                        this.next = function () {
                            router.navigate(this.project().editUrl() + '/' + this.sideNavTypes()[key + 1].menu()[0].route);
                        }.bind(this);
                    } else {
                        this.next = false
                    }
                }
            }.bind(this));



        }
    });

    /**
     * Checks that all parameters have been provided and are valid.
     *
     * @param {object} params An object of parameters to validate.
     * @returns {boolean} true if valid false otherwise.
     */
    CNav.checkRequiredParams = function(params) {
        var validated = true;
        if (params.name == undefined) {
            console.error('c-nav requires "name" parameter.');
            validated = false;
        }
        if (params.type == undefined) {
            console.error('c-nav requires "type" parameter.');
            validated = false;
        }
        return validated;
    };

    return CNav;

}));