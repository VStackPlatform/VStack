/**
 * Created by damian on 21/05/15.
 */
define(['knockout'], function(ko) {

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
            return {style: 'height: auto'};
        }
        return {style: 'height: 0'};
    };

    var SideNav = function(childRouter) {

        this.targetMenu = ko.computed(function () {
            return filterMenu(childRouter.navigationModel(), 'target');
        }, this);
        this.systemMenu = ko.computed(function () {
            return filterMenu(childRouter.navigationModel(), 'system');
        }, this);
        this.webServerMenu = ko.computed(function () {
            return filterMenu(childRouter.navigationModel(), 'webServer');
        }, this);
        this.databaseMenu = ko.computed(function () {
            return filterMenu(childRouter.navigationModel(), 'database');
        }, this);
        this.languageMenu = ko.computed(function () {
            return filterMenu(childRouter.navigationModel(), 'language');
        }, this);
        this.activeTarget = ko.computed(function () {
            return activeMenu(this.targetMenu());
        }, this);

        this.targetCss = ko.computed(function () {
            return menuCss(this.activeTarget());
        }, this);

        this.targetAttr = ko.computed(function () {
            return menuAttr(this.activeTarget());
        }, this);

        this.activeSystem = ko.computed(function () {
            return activeMenu(this.systemMenu());
        }, this);

        this.systemCss = ko.computed(function () {
            return menuCss(this.activeSystem());
        }, this);

        this.systemAttr = ko.computed(function () {
            return menuAttr(this.activeSystem());
        }, this);
        this.activeWebServer = ko.computed(function () {
            return activeMenu(this.webServerMenu());
        }, this);

        this.webServerCss = ko.computed(function () {
            return menuCss(this.activeWebServer());
        }, this);

        this.webServerAttr = ko.computed(function () {
            return menuAttr(this.activeWebServer());
        }, this);

        this.activeDatabase = ko.computed(function () {
            return activeMenu(this.databaseMenu());
        }, this);

        this.databaseCss = ko.computed(function () {
            return menuCss(this.activeDatabase());
        }, this);

        this.databaseAttr = ko.computed(function () {
            return menuAttr(this.activeDatabase());
        }, this);

        this.activeLanguage = ko.computed(function () {
            return activeMenu(this.languageMenu());
        }, this);

        this.languageCss = ko.computed(function () {
            return menuCss(this.activeLanguage());
        }, this);

        this.languageAttr = ko.computed(function () {
            return menuAttr(this.activeLanguage());
        }, this);
    };

    return SideNav;

});