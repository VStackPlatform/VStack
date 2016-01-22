define(['knockout', 'app-lib/models/NavItem', 'ko-postbox'], function(ko, NavItem, postbox) {

    var SideNav = function(childRouter) {

        this.types = ko.pureComputed(function() {
            var navItems = [];
            var navTypes = [];

            childRouter.navigationModel().forEach(function(value) {
                if (navTypes.indexOf(value.type) === -1) {
                    navTypes.push(value.type);
                }
            });
            navTypes.forEach(function(value, key) {
                navItems.push(new NavItem(value, childRouter.navigationModel(), key))
            });
            return navItems;

        }, this).publishOn('project.sideNavTypes');
    };

    return SideNav;

});