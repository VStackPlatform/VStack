/**
 * @module c-radio-list Component
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'knockout',
            'ko-mapping',
            'components/c-radio-list/models/CRadioList'
        ], factory);
    }
}(this, function(ko, mapping, CRadioList) {

    var viewModel = {
        createViewModel: function (params, componentInfo) {
            if (CRadioList.checkRequiredParams(params)) {
                return new CRadioList(params, componentInfo);
            } else {
                return false;
            }
        }
    };

    ko.components.register('c-radio-list', {
        viewModel: viewModel,
        template: { require: 'text!components/c-radio-list/c-radio-list.html' }
    });

    return viewModel;
}));