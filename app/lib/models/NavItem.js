define(['knockout'], function(ko) {
    var NavItem = function(type, menu, order) {

        var filterMenu = function (menu, type) {
            return ko.utils.arrayFilter(menu, function (route) {
                return route.type == type;
            });
        };

        var activeMenu = function (menu) {
            var active = false;
            ko.utils.arrayForEach(menu, function (route) {
                if (route.dynamicHash == undefined) {
                    route.dynamicHash = route.hash;
                }
                if (route.isActive() == true) {
                    active = true;
                    return false;
                }
            });
            return active;
        };

        var menuCss = function (active) {
            if (active) {
                return 'in';
            }
            return '';
        };

        var menuAttr = function (active) {
            if (active) {
                return {style: 'height: auto', id: this.nameToID()};
            }
            return {style: 'height: 0', id: this.nameToID()};
        }.bind(this);

        this.name = type;

        this.nameToID = function() {
            return this.name.replace(/ /, '-').toLowerCase();
        };

        this.menu = ko.pureComputed(function () {
            return filterMenu(menu, this.name);
        }, this);
        this.active = ko.pureComputed(function () {
            return activeMenu(this.menu());
        }, this);
        this.css = ko.pureComputed(function () {
            return menuCss(this.active());
        }, this);
        this.attr = ko.pureComputed(function () {
            return menuAttr(this.active());
        }, this);
    };

    return NavItem;
});