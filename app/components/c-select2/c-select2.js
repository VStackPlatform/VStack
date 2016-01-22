/**
 * @module c-select2 Component
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    var ko = require('knockout');
    var mapping = require('ko-mapping');
    var CSelect2 = require('components/c-select2/models/CSelect2');

    var viewModel = {
        createViewModel: function (params, componentInfo) {
            if (CSelect2.checkRequiredParams(params)) {
                return new CSelect2(params, componentInfo);
            } else {
                return false;
            }
        }
    };

    ko.components.register('c-select2', {
        viewModel: viewModel,
        template: { require: 'text!components/c-select2/c-select2.html' }
    });

    return viewModel;
}));