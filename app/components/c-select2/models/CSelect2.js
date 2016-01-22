/**
 * CSelect2 Model
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    var ko = require('knockout');
    var mapping = require('ko-mapping');
    var Component = require('components/models/Component');

    var CSelect2 = Component.extend({
        init: function(params, componentInfo) {
            mapping.fromJS(params, {copy: ['options']}, this);
        }
    });

    /**
     * Checks that all parameters have been provided and are valid.
     *
     * @param {object} params An object of parameters to validate.
     * @returns {boolean} true if valid false otherwise.
     */
    CSelect2.checkRequiredParams = function(params) {
        return Component.validate({
            "required": ['id', 'title', 'options', 'value']
        }, params, 'c-select2');
    };

    return CSelect2;
}));