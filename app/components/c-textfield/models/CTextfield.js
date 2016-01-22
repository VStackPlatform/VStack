/**
 * CTextfield Model
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

    var CTextfield = Component.extend({
        init: function(params, componentInfo) {
            this.defaults = {
                before: false,
                after: false
            };
            this.mapData(params, {}, this.defaults);
        }
    });

    /**
     * Checks that all parameters have been provided and are valid.
     *
     * @param {object} params An object of parameters to validate.
     * @returns {boolean} true if valid false otherwise.
     */
    CTextfield.checkRequiredParams = function(params) {
        var validated = true;
        if (params.value === undefined) {
            console.error('c-textfield requires parameter "value".');
            validated = false;
        }
        if (params.placeholder === undefined) {
            console.error('c-textfield requires parameter "placeholder".');
            validated = false;
        }
        return validated;
    };

    return CTextfield;
}));