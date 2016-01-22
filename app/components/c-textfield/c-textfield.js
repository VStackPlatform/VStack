/**
 * @module c-textfield Component
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    var ko = require('knockout');
    var mapping = require('ko-mapping');
    var CTextfield = require('components/c-textfield/models/CTextfield');

    var viewModel = {
        createViewModel: function (params, componentInfo) {
            if (CTextfield.checkRequiredParams(params)) {
                return new CTextfield(params, componentInfo);
            } else {
                return false;
            }
        }
    };

    ko.components.register('c-textfield', {
        viewModel: viewModel,
        template: { require: 'text!components/c-textfield/c-textfield.html' }
    });

    return viewModel;
}));