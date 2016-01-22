/**
 * @module c-group Component
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    var ko = require('knockout');
    var mapping = require('ko-mapping');
    var CGroup = require('components/c-group/models/CGroup');

    var viewModel = {
        createViewModel: function (params, componentInfo) {
            if (CGroup.checkRequiredParams(params)) {
                return new CGroup(params, componentInfo);
            } else {
                return false;
            }
        }
    };

    ko.components.register('c-group', {
        viewModel: viewModel,
        template: { require: 'text!components/c-group/c-group.html' }
    });

    return viewModel;
}));