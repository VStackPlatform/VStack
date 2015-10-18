/**
 * @module c-nav Component
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'knockout',
            'ko-mapping',
            'components/c-nav/models/CNav'
        ], factory);
    }
}(this, function(ko, mapping, CNav) {

    var viewModel = {
        createViewModel: function (params, componentInfo) {
            if (CNav.checkRequiredParams(params)) {
                return new CNav(params, componentInfo);
            } else {
                return false;
            }
        }
    };

    ko.components.register('c-nav', {
        viewModel: viewModel,
        template: { require: 'text!components/c-nav/c-nav.html' }
    });

    return viewModel;
}));