/**
 * CSelect Model
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

    var CSelect = Component.extend({
        init: function(params, componentInfo) {
            params.optionsValue = params.optionsValue || 'key';
            params.optionsText = params.optionsText || 'value';
            mapping.fromJS(params, {"copy": ["optionsValue", "optionsText"]}, this);

            /**
             * Checks if options is an object.
             */
            this.optionsIsObject = ko.pureComputed(function() {
                return typeof this.options() === 'object';
            }, this);
        }
    });

    /**
     * Checks that all parameters have been provided and are valid.
     *
     * @param {object} params An object of parameters to validate.
     * @returns {boolean} true if valid false otherwise.
     */
    CSelect.checkRequiredParams = function(params) {
        return Component.validate({
            "required": ['title', 'value', 'options']
        }, params, 'c-select');
    };

    return CSelect;
}));