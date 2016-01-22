define(['knockout'], function(ko) {
    var Header = function(title) {

        title = title || 'Welcome to the VStack.';

        this.displayName = ko.observable(title);
        this.showBanner = ko.observable(localStorage.showBanner != undefined ? localStorage.showBanner== 'true' : true);
        this.bannerToggle = function() {
            localStorage.showBanner = !this.showBanner();
            this.showBanner(!this.showBanner());
        };
        this.bannerToggleClass = ko.pureComputed(function() {
            return this.showBanner() ? 'fa-angle-up' : 'fa-angle-down';
        }, this);
    };
    return Header;
});