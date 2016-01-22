/**
 * CAddon Model
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    var ko = require('knockout');
    var Component = require('components/models/Component');
    var mapping = require('ko-mapping');

    var CAddon = Component.extend({
        init: function(params) {
            params.readonly = params.readonly || false;
            mapping.fromJS(params, {}, this);
        }
    });

    /**
     * Checks that all parameters have been provided and are valid.
     *
     * @param {object} params An object of parameters to validate.
     * @returns {boolean} true if valid false otherwise.
     */
    CAddon.checkRequiredParams = function(params) {
        var validated = true;
        return validated;
    };

    return CAddon;
}));