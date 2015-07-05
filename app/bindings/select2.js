define(['jquery', 'knockout', 'select2'], function($, ko) {
    ko.bindingHandlers.select2 = {
        update: function(element, valueAccessor, allBindingsAccessor) {

            var $el = $(element);
            var all = allBindingsAccessor();
            var options = valueAccessor();
            if (!ko.isObservable(options)) {
                options = ko.observable(options);
            }

            if ($el.select2 != undefined) {
                $el.select2('destroy');
            }
            if (options() == 'true') {
                $el.select2();
            } else {
                $el.select2(options())
                    .on("select2-removed", function(event) {
                        if (all.select2val != undefined && all.select2val.peek() !== undefined) {
                            // Long way around in case its a computed not array.
                            all.select2val(all.select2val().filter(function(value) { return value !== event.val }));
                        }
                    })
                    .on("change", function(event) {
                        if (all.select2val !== undefined) {
                            if (ko.isObservable(all.select2val)) {
                                all.select2val(event.val);
                            } else {
                                all.select2val = event.val;
                            }
                        }
                    });

                // Set the initial value.
                if (all.select2val !== undefined) {
                    $el.select2('val', ((ko.isObservable(all.select2val) ? all.select2val.peek() : all.select2val)), false);
                }
            }
        }
    };
});