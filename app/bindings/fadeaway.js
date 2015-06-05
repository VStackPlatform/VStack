/**
 * Created by damian on 20/05/15.
 */
/**
 * Created by damian on 8/05/15.
 */
define(['jquery', 'knockout'], function($, ko) {
    ko.bindingHandlers.fadeaway = {
        update: function(element, valueAccessor, allBindingsAccessor) {
            var $el = $(element);
            var time = valueAccessor();
            if (!ko.isObservable(time)) {
                time = ko.observable(time);
            }
            setTimeout(function() {
                $el.fadeOut(3000);
            }, time());
        }
    };
});