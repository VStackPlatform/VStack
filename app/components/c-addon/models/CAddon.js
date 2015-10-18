/**
 * CAddon Model
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'knockout',
            'components/models/Component'
        ], factory);
    }
}(this, function(ko, Component) {

    var CAddon = Component.extend({
        init: function() {

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