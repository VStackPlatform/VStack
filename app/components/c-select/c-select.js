/**
 * @module c-select Component
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    var ko = require('knockout');
    var mapping = require('ko-mapping');
    var CSelect = require('components/c-select/models/CSelect');

    var viewModel = {
        createViewModel: function (params, componentInfo) {
            if (CSelect.checkRequiredParams(params)) {
                return new CSelect(params, componentInfo);
            } else {
                return false;
            }
        }
    };

    ko.components.register('c-select', {
        viewModel: viewModel,
        template: { require: 'text!components/c-select/c-select.html' }
    });

    return viewModel;
}));