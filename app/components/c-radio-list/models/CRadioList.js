/**
 * CRadioList Model
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'knockout',
            'components/models/Component',
            'ko-mapping'
        ], factory);
    }
}(this, function(ko, Component, mapping) {
    var CRadioList = Component.extend({
        init: function(params) {
            mapping.fromJS(params, {}, this);
        },
        isObject: function(item) {
            return typeof item == 'object';
        }
    });

    /**
     * Checks that all parameters have been provided and are valid.
     *
     * @param {object} params An object of parameters to validate.
     * @returns {boolean} true if valid false otherwise.
     */
    CRadioList.checkRequiredParams = function(params) {
        var validated = true;
        if (params.title === undefined) {
            validated = false;
            console.error('c-radio-list requires parameter "title".');
        }
        if (params.options === undefined) {
            validated = false;
            console.error('c-radio-list requires parameter "options".');
        }
        return validated;
    };

    return CRadioList;
}));