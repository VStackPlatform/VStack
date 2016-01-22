/**
 * @module c-help Component
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    require('bindings/popover/popover');

    var ko = require('knockout');
    var mapping = require('ko-mapping');
    var CHelp = require('components/c-help/models/CHelp');

    var viewModel = {
        createViewModel: function (params, componentInfo) {
            if (CHelp.checkRequiredParams(params)) {
                return new CHelp(params, componentInfo);
            } else {
                return false;
            }
        }
    };

    ko.components.register('c-help', {
        viewModel: viewModel,
        template: { require: 'text!components/c-help/c-help.html' }
    });

    return viewModel;
}));