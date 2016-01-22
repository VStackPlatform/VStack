/**
 * Binding Model
 *
 * Base library for reusable binding methods.
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    }
}(this, function(require) {

    var ko = require('knockout');
    var _ = require('lodash');
    var Class = require('app-lib/models/Class');
    var $ = require('jquery');

    var Binding = Class.extend({
        ignoreProperties: [
            'args',
            'isVirtual',
            'validate',
            'loadParams',
            'init',
            '_super',
            'ignoreProperties',
            'checkRequiredParams',
            'begin',
            'update',
            'element'
        ],
        init: function () {
            this.args = {};
        },
        /**
         * Makes validation for binding args simple.
         *
         * @param {object} rules The rules that are added to the binding.
         * @param {boolean} outputError Whether to output a console error.
         * @returns {boolean} If the validation was successful.
         */
        validate: function(rules, outputError) {
            outputError = outputError === undefined ? true : outputError;
            var validated = true;
            ko.utils.objectForEach(rules, function(type, args) {
                switch (type) {
                    case 'required':
                        args.forEach(function(arg) {
                            if (this[arg] === undefined) {
                                if (outputError) {
                                    console.error(
                                        this.args.bindingName +
                                        ' binding requires that parameter "' +
                                        arg +
                                        '" be defined.'
                                    );
                                }
                                validated = false;
                            }
                        }.bind(this));
                        break;
                }
            }.bind(this));
            return validated;
        },

        /**
         * Loads extracts the valueAssessor if its an object and extracts params into the current object.
         *
         * @param {object} params The parameters from init and update.
         * @param {boolean} outputError Whether to push an error to the console.
         */
        loadParams: function(params, outputError) {
            outputError = outputError === undefined ? true : outputError;
            //element, valueAccessor, allBindings, viewModel, bindingContext
            var valueAccessor = ko.unwrap(params.valueAccessor());
            if (_.isObject(valueAccessor)) {
                var errors = _.intersection(_.keys(valueAccessor), this.ignoreProperties);
                if (errors.length > 0) {
                    if (outputError) {
                        console.error(
                            params.bindingName +
                            ' can not use the following parameters as they are reserved: "' +
                            errors.join(', ') +
                            '".'
                        );
                    }
                    return false;
                } else {
                    _.merge(this, valueAccessor);
                }
            } else {
                this.value = valueAccessor;
            }
            _.merge(this.args, params);
            this.element = $(params.element);
            return true;
        }
    });

    return Binding;

}));