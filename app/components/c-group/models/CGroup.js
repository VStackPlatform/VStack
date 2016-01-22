/**
 * CGroup Model
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

    var CGroup = Component.extend({
        init: function(params, componentInfo) {
            mapping.fromJS(params, {copy: ['model', 'models']}, this);

            this.addModel = function() {
                this.models.push(new this.model());
            }.bind(this);

            this.removeModel = function(model) {
                this.models.remove(model);
            }.bind(this);
        }
    });

    /**
     * Checks that all parameters have been provided and are valid.
     *
     * @param {object} params An object of parameters to validate.
     * @returns {boolean} true if valid false otherwise.
     */
    CGroup.checkRequiredParams = function(params) {
        var validated = true;
        if (params.label === undefined) {
            validated = false;
            console.error('c-group requires parameter "label".');
        }
        if (params.model === undefined) {
            validated = false;
            console.error('c-group requires parameter "model".');
        } else if (typeof params.model !== 'function') {
            validated = false;
            console.error('c-group requires parameter "model" be a constructor.');
        }
        if (params.models === undefined) {
            validated = false;
            console.error('c-group requires parameter "models".');
        }
        if (!ko.isObservable(params.models)) {
            console.warn('c-group parameter "models" should be an observable to be of use.');
        }
        return validated;
    };

    return CGroup;
}));