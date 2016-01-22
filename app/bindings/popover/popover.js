/**
 * @module popover Binding
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    var ko = require('knockout');
    var mapping = require('ko-mapping');
    var Popover = require('bindings/popover/models/Popover');

    ko.bindingHandlers.popover = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var loaded = Popover.loadParams({
                bindingName: 'popover',
                element: element,
                valueAccessor: valueAccessor,
                allBindings: allBindings,
                viewModel: viewModel,
                bindingContext: bindingContext
            });
            if (loaded && Popover.checkRequiredParams(true)) {
                Popover.begin();
            }
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var loaded = Popover.loadParams({
                bindingName: 'popover',
                element: element,
                valueAccessor: valueAccessor,
                allBindings: allBindings,
                viewModel: viewModel,
                bindingContext: bindingContext
            }, false);
            if (loaded && Popover.checkRequiredParams(false)) {
                Popover.update();
            }
        }
    };

    if (Popover.isVirtual) {
        ko.virtualElements.allowedBindings.popover = true;
    }

    return Popover;
}));