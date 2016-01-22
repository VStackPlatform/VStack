/**
 * CHelp Model
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

    var CHelp = Component.extend({
        init: function(params, componentInfo) {
            this._super();
            this.defaults = {
                content: this.nodesToHtml(componentInfo.templateNodes),
                placement: 'right',
                trigger: 'hover',
                html: true
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
    CHelp.checkRequiredParams = function(params) {
        return Component.validate({
            "required": []
        }, params, 'c-help');
    };

    return CHelp;
}));