/**
 * @module c-addon Component
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'knockout',
            'ko-mapping',
            'components/c-addon/models/CAddon',
            'components/c-nav/c-nav'
        ], factory);
    }
}(this, function(ko, mapping, CAddon) {

    var viewModel = {
        createViewModel: function (params, componentInfo) {
            if (CAddon.checkRequiredParams(params)) {
                return new CAddon(params, componentInfo);
            } else {
                return false;
            }
        }
    };

    ko.components.register('c-addon', {
        viewModel: viewModel,
        template: { require: 'text!components/c-addon/c-addon.html' }
    });

    return viewModel;
}));