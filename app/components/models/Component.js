/**
 * Component Model
 *
 * Base library for reusable component methods.
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'knockout',
            'app-lib/models/Class',
            'jquery'
        ], factory);
    }
}(this, function(ko, Class, $) {

    return Class.extend({
        init: function() {

        },

        /**
         * Adds parameters to child components.
         *
         * @param {string} componentTag The tag of the child component.
         * @param {string} paramName The parameter to add to the child component.
         * @param {string} paramValue The value to add to the child component
         * @param {object} componentInfo The componentInfo object from the parent component.
         * @param {boolean} paramLiteral Whether the paramValue should be a string or an observable of the parent component.
         * @returns {*}
         */
        addParamToSubComponent: function(componentTag, paramName, paramValue, componentInfo, paramLiteral) {

            paramLiteral = paramLiteral || false;

            var nameValue = paramName + ': \'' + paramValue + '\'';
            if (paramLiteral) {
                nameValue = paramName + ':' + paramValue;
            }

            //Add required data to other components.
            componentInfo.templateNodes.forEach(function (value) {

                var element = $(value);
                var subParams = element.attr('params');
                var subComponents;

                // Transform component to include data.
                var componentElement = [componentTag.toUpperCase()].indexOf(value.tagName);
                if (componentElement != -1) {
                    if (!subParams) {
                        element.attr('params', nameValue);
                    } else {
                        if (!subParams.match(new RegExp(paramName + ':'))) {
                            element.attr('params', element.attr('params') + ', ' + nameValue);
                        }
                    }
                } else {
                    subComponents = element.find(componentTag);

                    if (subComponents.length > 0) {
                        $.each(subComponents, function (key, sub) {
                            var subCompParams = $(sub).attr('params');
                            if (!subCompParams) {
                                $(sub).attr('params', nameValue);
                            } else {
                                if (!subCompParams.match(new RegExp(paramName + ':'))) {
                                    $(sub).attr('params', $(sub).attr('params') + ', ' + nameValue);
                                }
                            }
                        }.bind(this));
                    }
                }

            });


            return componentInfo;

        }
    });

}));